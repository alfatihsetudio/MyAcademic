<?php

namespace App\Services\WebAuthn;

use Exception;

class CborDecoder
{
    /**
     * Decode CBOR data from binary string.
     *
     * @param string $data Binary string
     * @param int $offset Offset reference
     * @return mixed
     * @throws Exception
     */
    public static function decode(string $data, int &$offset = 0)
    {
        if ($offset >= strlen($data)) {
            throw new Exception("CBOR decode error: unexpected end of data at offset {$offset}");
        }

        $byte = ord($data[$offset++]);
        $majorType = $byte >> 5;
        $val = $byte & 0x1F;

        $length = self::readLength($val, $data, $offset);

        switch ($majorType) {
            case 0: // Unsigned integer
                return $length;

            case 1: // Negative integer: -1 - val
                return -1 - $length;

            case 2: // Byte string
                $str = substr($data, $offset, $length);
                $offset += $length;
                return $str;

            case 3: // UTF-8 text string
                $str = substr($data, $offset, $length);
                $offset += $length;
                return $str;

            case 4: // Array
                $array = [];
                for ($i = 0; $i < $length; $i++) {
                    $array[] = self::decode($data, $offset);
                }
                return $array;

            case 5: // Map
                $map = [];
                for ($i = 0; $i < $length; $i++) {
                    $k = self::decode($data, $offset);
                    $v = self::decode($data, $offset);
                    $map[$k] = $v;
                }
                return $map;

            case 6: // Tagged item
                return self::decode($data, $offset);

            case 7: // Simple / float
                if ($val === 20) return false;
                if ($val === 21) return true;
                if ($val === 22) return null;
                if ($val === 23) return null; // undefined
                return null;

            default:
                throw new Exception("CBOR decode error: unsupported major type {$majorType}");
        }
    }

    private static function readLength(int $val, string $data, int &$offset): int
    {
        if ($val < 24) {
            return $val;
        }

        if ($val === 24) {
            $length = ord($data[$offset]);
            $offset += 1;
            return $length;
        }

        if ($val === 25) {
            $length = unpack('n', substr($data, $offset, 2))[1];
            $offset += 2;
            return $length;
        }

        if ($val === 26) {
            $length = unpack('N', substr($data, $offset, 4))[1];
            $offset += 4;
            return $length;
        }

        if ($val === 27) {
            $arr = unpack('J', substr($data, $offset, 8));
            $length = $arr[1];
            $offset += 8;
            return $length;
        }

        if ($val === 31) {
            throw new Exception("CBOR decode error: indefinite length not supported");
        }

        throw new Exception("CBOR decode error: invalid additional information {$val}");
    }
}
