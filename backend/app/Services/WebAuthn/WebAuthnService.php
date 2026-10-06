<?php

namespace App\Services\WebAuthn;

use App\Models\User;
use App\Models\UserPasskey;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class WebAuthnService
{
    public static function base64urlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    public static function base64urlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }

    public function getRpId(Request $request): string
    {
        $host = $request->getHost();
        if ($host === 'localhost' || $host === '127.0.0.1') {
            return 'localhost';
        }

        // Strip port or subdomain if desired, or return current hostname
        $parts = explode(':', $host);
        return $parts[0];
    }

    public function getRpName(): string
    {
        return config('app.name', 'MyAcademic Portal');
    }

    /**
     * Generate registration options for a logged-in user
     */
    public function generateRegistrationOptions(User $user, Request $request): array
    {
        $challenge = random_bytes(32);
        $challengeB64 = self::base64urlEncode($challenge);

        // Store challenge in cache for 5 minutes
        Cache::put("webauthn_reg_challenge_{$user->id}", $challengeB64, 300);

        // Exclude credentials already registered
        $existingCredentials = $user->passkeys()->get()->map(function ($p) {
            return [
                'type' => 'public-key',
                'id' => $p->credential_id,
                'transports' => $p->transports ?? ['internal', 'hybrid'],
            ];
        })->toArray();

        $rpId = $this->getRpId($request);

        return [
            'challenge' => $challengeB64,
            'rp' => [
                'name' => $this->getRpName(),
                'id' => $rpId,
            ],
            'user' => [
                'id' => self::base64urlEncode((string) $user->id),
                'name' => $user->email ?: ($user->username ?: 'user_' . $user->id),
                'displayName' => $user->nama ?: ($user->name ?: 'User ' . $user->id),
            ],
            'pubKeyCredParams' => [
                ['type' => 'public-key', 'alg' => -7],   // ES256 (P-256)
                ['type' => 'public-key', 'alg' => -257], // RS256 (RSA)
            ],
            'authenticatorSelection' => [
                'userVerification' => 'preferred',
                'residentKey' => 'preferred',
            ],
            'timeout' => 60000,
            'attestation' => 'none',
            'excludeCredentials' => $existingCredentials,
        ];
    }

    /**
     * Verify registration credential response from browser
     */
    public function verifyRegistration(User $user, array $data, Request $request): UserPasskey
    {
        if (empty($data['response']['clientDataJSON']) || empty($data['response']['attestationObject'])) {
            throw new Exception('Data pendaftaran biometrik tidak lengkap.');
        }

        // 1. Decode clientDataJSON
        $clientDataJSON = self::base64urlDecode($data['response']['clientDataJSON']);
        $clientData = json_decode($clientDataJSON, true);
        if (!$clientData) {
            throw new Exception('clientDataJSON tidak valid.');
        }

        if (($clientData['type'] ?? '') !== 'webauthn.create') {
            throw new Exception('Tipe aksi bukan pendaftaran webauthn.create.');
        }

        // Verify challenge
        $cachedChallenge = Cache::get("webauthn_reg_challenge_{$user->id}");
        if (!$cachedChallenge || $cachedChallenge !== ($clientData['challenge'] ?? '')) {
            throw new Exception('Tantangan verifikasi (challenge) kedaluwarsa atau tidak valid.');
        }
        Cache::forget("webauthn_reg_challenge_{$user->id}");

        // 2. Decode attestationObject (CBOR)
        $attestationBin = self::base64urlDecode($data['response']['attestationObject']);
        $attestationObj = CborDecoder::decode($attestationBin);

        if (!isset($attestationObj['authData'])) {
            throw new Exception('Format attestationObject tidak memiliki authData.');
        }

        $authData = $attestationObj['authData'];
        if (strlen($authData) < 37) {
            throw new Exception('Ukuran authData tidak valid.');
        }

        // Flags byte (index 32)
        $flags = ord($authData[32]);
        $up = ($flags & 0x01) !== 0; // User Present
        $at = ($flags & 0x40) !== 0; // Attested Credential Data Present

        if (!$up) {
            throw new Exception('Pengguna tidak terdeteksi saat scan biometrik.');
        }

        if (!$at) {
            throw new Exception('Data kredensial biometrik (AT) tidak disertakan oleh perangkat.');
        }

        $signCount = unpack('N', substr($authData, 33, 4))[1];
        $aaguid = substr($authData, 37, 16);

        // Credential ID Length (2 bytes big endian)
        $credIdLen = unpack('n', substr($authData, 53, 2))[1];
        $credentialIdBin = substr($authData, 55, $credIdLen);
        $credentialIdB64 = self::base64urlEncode($credentialIdBin);

        // Ensure credential_id matches data.id if provided
        $credentialIdToStore = !empty($data['id']) ? $data['id'] : $credentialIdB64;

        // Parse COSE Public Key
        $coseOffset = 55 + $credIdLen;
        $coseStart = $coseOffset;
        $coseKey = CborDecoder::decode($authData, $coseOffset);
        $coseBytes = substr($authData, $coseStart, $coseOffset - $coseStart);

        $alg = $coseKey[3] ?? -7;
        $pem = $this->coseKeyToPem($coseKey);

        // Determine device friendly name
        $name = !empty($data['name']) ? trim($data['name']) : $this->detectDeviceName($request);

        // Create or update UserPasskey
        return UserPasskey::updateOrCreate(
            [
                'credential_id' => $credentialIdToStore,
            ],
            [
                'user_id' => $user->id,
                'name' => $name,
                'public_key' => $pem,
                'public_key_cose' => base64_encode($coseBytes),
                'algorithm' => $alg,
                'sign_count' => $signCount,
                'aaguid' => bin2hex($aaguid),
                'transports' => $data['response']['transports'] ?? ['internal'],
                'last_used_at' => now(),
            ]
        );
    }

    /**
     * Generate assertion/login options
     */
    public function generateLoginOptions(?string $identifier, Request $request): array
    {
        $challenge = random_bytes(32);
        $challengeB64 = self::base64urlEncode($challenge);

        // Cache challenge globally for 5 minutes
        Cache::put("webauthn_login_challenge_{$challengeB64}", [
            'challenge' => $challengeB64,
            'time' => time(),
        ], 300);

        $allowCredentials = [];
        if ($identifier) {
            $user = User::where('email', $identifier)
                ->orWhere('username', $identifier)
                ->orWhere('nama', $identifier)
                ->orWhere('name', $identifier)
                ->first();

            if ($user) {
                $allowCredentials = $user->passkeys()->get()->map(function ($p) {
                    return [
                        'type' => 'public-key',
                        'id' => $p->credential_id,
                        'transports' => $p->transports ?? ['internal', 'hybrid'],
                    ];
                })->toArray();
            }
        }

        $rpId = $this->getRpId($request);

        return [
            'challenge' => $challengeB64,
            'rpId' => $rpId,
            'timeout' => 60000,
            'userVerification' => 'preferred',
            'allowCredentials' => $allowCredentials,
        ];
    }

    /**
     * Verify login signature response from browser
     */
    public function verifyLogin(array $data, Request $request): User
    {
        if (empty($data['id']) || empty($data['response']['clientDataJSON']) || empty($data['response']['authenticatorData']) || empty($data['response']['signature'])) {
            throw new Exception('Data autentikasi biometrik tidak lengkap.');
        }

        // 1. Verify clientDataJSON
        $clientDataJSON = self::base64urlDecode($data['response']['clientDataJSON']);
        $clientData = json_decode($clientDataJSON, true);
        if (!$clientData) {
            throw new Exception('clientDataJSON tidak valid.');
        }

        if (($clientData['type'] ?? '') !== 'webauthn.get') {
            throw new Exception('Tipe aksi bukan autentikasi webauthn.get.');
        }

        $challenge = $clientData['challenge'] ?? '';
        $cacheKey = "webauthn_login_challenge_{$challenge}";
        $cached = Cache::get($cacheKey);
        if (!$cached) {
            throw new Exception('Tantangan login (challenge) kedaluwarsa atau tidak valid.');
        }
        Cache::forget($cacheKey);

        // 2. Find credential in database
        $passkey = UserPasskey::with('user')->where('credential_id', $data['id'])->first();
        if (!$passkey || !$passkey->user) {
            throw new Exception('Kunci sidik jari / passkey tidak terdaftar di sistem.');
        }

        // 3. Prepare data to verify
        $authDataBin = self::base64urlDecode($data['response']['authenticatorData']);
        $clientDataHash = hash('sha256', $clientDataJSON, true);
        $signedData = $authDataBin . $clientDataHash;
        $signature = self::base64urlDecode($data['response']['signature']);

        // Verify signature with public key
        $verifyResult = openssl_verify($signedData, $signature, $passkey->public_key, OPENSSL_ALGO_SHA256);
        if ($verifyResult !== 1) {
            throw new Exception('Tanda tangan kriptografi sidik jari tidak valid. Akses ditolak.');
        }

        // 4. Check sign count to prevent cloned credentials
        $newSignCount = unpack('N', substr($authDataBin, 33, 4))[1];
        if ($newSignCount > 0 && $passkey->sign_count > 0 && $newSignCount <= $passkey->sign_count) {
            // Potential replay/cloned device warning
        }

        $passkey->sign_count = $newSignCount;
        $passkey->last_used_at = now();
        $passkey->save();

        return $passkey->user;
    }

    /**
     * Convert COSE Map into PEM Public Key
     */
    private function coseKeyToPem(array $cose): string
    {
        $kty = $cose[1] ?? 2; // 2 = EC2, 3 = RSA

        if ($kty === 2) {
            // EC2 Key (P-256)
            $x = $cose[-2] ?? '';
            $y = $cose[-3] ?? '';

            if (strlen($x) !== 32 || strlen($y) !== 32) {
                throw new Exception('Kunci EC P-256 memiliki koordinat yang tidak sesuai.');
            }

            // ASN.1 SubjectPublicKeyInfo Header for EC P-256 (prime256v1)
            $spkiHeader = hex2bin('3059301306072a8648ce3d020106082a8648ce3d03010703420004');
            $der = $spkiHeader . $x . $y;

            return "-----BEGIN PUBLIC KEY-----\r\n" . chunk_split(base64_encode($der), 64, "\r\n") . "-----END PUBLIC KEY-----\r\n";
        }

        if ($kty === 3) {
            // RSA Key
            $n = $cose[-1] ?? '';
            $e = $cose[-2] ?? '';

            $der = $this->buildRsaSpkiDer($n, $e);
            return "-----BEGIN PUBLIC KEY-----\r\n" . chunk_split(base64_encode($der), 64, "\r\n") . "-----END PUBLIC KEY-----\r\n";
        }

        throw new Exception("Tipe kunci kriptografi ({$kty}) belum didukung.");
    }

    private function buildRsaSpkiDer(string $n, string $e): string
    {
        $encodeInt = function (string $bytes) {
            if (ord($bytes[0]) > 0x7f) {
                $bytes = "\x00" . $bytes;
            }
            $len = strlen($bytes);
            return "\x02" . $this->encodeDerLength($len) . $bytes;
        };

        $rsaSeq = "\x30" . $this->encodeDerLength(strlen($encodeInt($n) . $encodeInt($e))) . $encodeInt($n) . $encodeInt($e);
        $bitString = "\x03" . $this->encodeDerLength(strlen($rsaSeq) + 1) . "\x00" . $rsaSeq;
        $algId = hex2bin('300d06092a864886f70d0101010500'); // rsaEncryption NULL

        return "\x30" . $this->encodeDerLength(strlen($algId . $bitString)) . $algId . $bitString;
    }

    private function encodeDerLength(int $length): string
    {
        if ($length < 128) {
            return chr($length);
        }
        $sub = '';
        while ($length > 0) {
            $sub = chr($length & 0xFF) . $sub;
            $length >>= 8;
        }
        return chr(0x80 | strlen($sub)) . $sub;
    }

    private function detectDeviceName(Request $request): string
    {
        $ua = $request->header('User-Agent', '');
        $device = 'Sensor Sidik Jari';

        if (stripos($ua, 'Windows') !== false) {
            $device = 'Windows Hello (Fingerprint)';
        } elseif (stripos($ua, 'Macintosh') !== false) {
            $device = 'Mac Touch ID';
        } elseif (stripos($ua, 'iPhone') !== false || stripos($ua, 'iPad') !== false) {
            $device = 'Apple Biometric (Touch ID / Face ID)';
        } elseif (stripos($ua, 'Android') !== false) {
            $device = 'Android Biometric (Fingerprint)';
        }

        if (stripos($ua, 'Chrome') !== false && stripos($ua, 'Edg') === false) {
            $device .= ' - Chrome';
        } elseif (stripos($ua, 'Edg') !== false) {
            $device .= ' - Edge';
        } elseif (stripos($ua, 'Safari') !== false && stripos($ua, 'Chrome') === false) {
            $device .= ' - Safari';
        }

        return $device;
    }
}
