<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserPasskey;
use App\Services\WebAuthn\WebAuthnService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class WebAuthnTest extends TestCase
{
    public function test_can_generate_login_options()
    {
        $response = $this->postJson('/api/webauthn/login/options');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'challenge',
            'rpId',
            'timeout',
            'userVerification',
            'allowCredentials',
        ]);
    }

    public function test_can_generate_registration_options_when_authenticated()
    {
        $user = User::first();
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/webauthn/register/options');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'challenge',
            'rp' => ['name', 'id'],
            'user' => ['id', 'name', 'displayName'],
            'pubKeyCredParams',
            'authenticatorSelection',
        ]);

        $this->assertTrue(Cache::has("webauthn_reg_challenge_{$user->id}"));
    }

    public function test_can_list_user_passkeys()
    {
        $user = User::first();
        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/webauthn/passkeys');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'passkeys',
        ]);
    }

    public function test_biometric_login_with_valid_signature()
    {
        $user = User::first();

        // 1. Generate an EC key pair to simulate authenticator
        $cnf = 'C:/xampp/php/extras/ssl/openssl.cnf';
        $keyConfig = ['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC];
        if (file_exists($cnf)) {
            $keyConfig['config'] = $cnf;
        }

        $ecKey = openssl_pkey_new($keyConfig);
        $details = openssl_pkey_get_details($ecKey);
        $pubPem = $details['key'];

        $credId = 'test_cred_' . bin2hex(random_bytes(16));

        // Create passkey in DB
        $passkey = UserPasskey::create([
            'user_id' => $user->id,
            'credential_id' => $credId,
            'name' => 'Test Biometric Sensor',
            'public_key' => $pubPem,
            'algorithm' => -7,
            'sign_count' => 0,
        ]);

        // 2. Request login options
        $optionsRes = $this->postJson('/api/webauthn/login/options', [
            'identifier' => $user->email,
        ]);
        $options = $optionsRes->json();
        $challenge = $options['challenge'];

        // 3. Simulate Authenticator response
        $clientDataObj = [
            'type' => 'webauthn.get',
            'challenge' => $challenge,
            'origin' => 'http://localhost:3000',
        ];
        $clientDataJSON = json_encode($clientDataObj);
        $clientDataJSONB64 = WebAuthnService::base64urlEncode($clientDataJSON);

        // Authenticator Data: 32 bytes rpIdHash + 1 byte flags (0x01 = UP) + 4 bytes counter
        $rpIdHash = hash('sha256', 'localhost', true);
        $flags = chr(0x01);
        $counter = pack('N', 1);
        $authenticatorData = $rpIdHash . $flags . $counter;
        $authenticatorDataB64 = WebAuthnService::base64urlEncode($authenticatorData);

        // Sign: authenticatorData + sha256(clientDataJSON)
        $clientDataHash = hash('sha256', $clientDataJSON, true);
        $signedData = $authenticatorData . $clientDataHash;
        openssl_sign($signedData, $signature, $ecKey, OPENSSL_ALGO_SHA256);
        $signatureB64 = WebAuthnService::base64urlEncode($signature);

        // 4. Verify login via endpoint
        $verifyRes = $this->postJson('/api/webauthn/login/verify', [
            'id' => $credId,
            'response' => [
                'clientDataJSON' => $clientDataJSONB64,
                'authenticatorData' => $authenticatorDataB64,
                'signature' => $signatureB64,
            ],
        ]);

        $verifyRes->assertStatus(200);
        $verifyRes->assertJson([
            'success' => true,
        ]);
        $this->assertNotEmpty($verifyRes->json('token'));
        $this->assertEquals($user->id, $verifyRes->json('user.id'));

        // Clean up
        $passkey->delete();
    }

    public function test_can_delete_registered_passkey()
    {
        $user = User::first();
        $this->actingAs($user, 'sanctum');

        $passkey = UserPasskey::create([
            'user_id' => $user->id,
            'credential_id' => 'test_del_' . bin2hex(random_bytes(16)),
            'name' => 'Device to delete',
            'public_key' => 'dummy_key',
            'algorithm' => -7,
            'sign_count' => 0,
        ]);

        $res = $this->deleteJson('/api/webauthn/passkeys/' . $passkey->id);
        $res->assertStatus(200);
        $res->assertJson(['success' => true]);

        $this->assertDatabaseMissing('user_passkeys', ['id' => $passkey->id]);
    }
}
