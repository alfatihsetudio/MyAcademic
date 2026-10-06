<?php

namespace App\Helpers;

class LetterHtmlSanitizer
{
    protected static array $allowedTags = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u',
        'ol', 'ul', 'li',
        'figure',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'colgroup', 'col',
        'div', 'span',
    ];

    public static function sanitize(?string $html): string
    {
        if ($html === null || $html === '') {
            return '';
        }

        $html = preg_replace('/<script[^>]*>.*?<\/script>/is', '', $html);
        $html = preg_replace('/<style[^>]*>.*?<\/style>/is', '', $html);

        $allowed = '<' . implode('><', self::$allowedTags) . '>';
        $html = strip_tags($html, $allowed);

        $html = preg_replace_callback('/<(\/?)(\w+)([^>]*)>/', function ($m) {
            $tag = strtolower($m[2]);
            $isClosing = $m[1] === '/';

            if (!in_array($tag, self::$allowedTags)) {
                return $isClosing ? '</' . $tag . '>' : '<' . $tag . '>';
            }

            if ($isClosing) {
                return '</' . $tag . '>';
            }

            $attrs = $m[3];
            $cleanAttrs = '';

            if (in_array($tag, ['p', 'div', 'span'])) {
                if (preg_match('/class\s*=\s*"([^"]*)"/i', $attrs, $cm)) {
                    $classes = array_filter(array_map('trim', explode(' ', $cm[1])), function ($c) {
                        return preg_match('/^ql-align-(center|right|justify)$/', $c) || preg_match('/^ql-indent-[1-9]$/', $c);
                    });
                    if (!empty($classes)) {
                        $cleanAttrs .= ' class="' . implode(' ', $classes) . '"';
                    }
                }
                if (preg_match('/style\s*=\s*"([^"]*)"/i', $attrs, $sm)) {
                    $allowedStyles = [];
                    if (preg_match('/text-align\s*:\s*(left|center|right)/i', $sm[1], $am)) {
                        $allowedStyles[] = 'text-align:' . strtolower($am[1]);
                    }
                    if (preg_match('/margin-left\s*:\s*\d+px/i', $sm[1], $mm)) {
                        $allowedStyles[] = trim($mm[0]);
                    }
                    if (!empty($allowedStyles)) {
                        $cleanAttrs .= ' style="' . implode('; ', $allowedStyles) . '"';
                    }
                }
            }

            if ($tag === 'figure') {
                if (preg_match('/class\s*=\s*"([^"]*)"/i', $attrs, $cm)) {
                    $classes = self::filterClasses($cm[1], ['table', 'no-border-table']);
                    if (!empty($classes) && in_array('table', $classes, true)) {
                        $cleanAttrs .= ' class="' . implode(' ', $classes) . '"';
                    }
                }
            }

            if (in_array($tag, ['col', 'colgroup'])) {
                if (preg_match('/style\s*=\s*"([^"]*)"/i', $attrs, $sm)) {
                    $allowedStyles = [];
                    if (preg_match('/width\s*:\s*[\d.]+(?:%|px|em)?/i', $sm[1], $wm)) {
                        $allowedStyles[] = trim($wm[0]);
                    }
                    if (!empty($allowedStyles)) {
                        $cleanAttrs .= ' style="' . implode('; ', $allowedStyles) . '"';
                    }
                }
                if (preg_match('/width\s*=\s*"([^"]*)"/i', $attrs, $wam)) {
                    $cleanAttrs .= ' width="' . htmlspecialchars($wam[1], ENT_QUOTES) . '"';
                }
            }

            if (in_array($tag, ['table', 'td', 'th'])) {
                if (preg_match('/class\s*=\s*"([^"]*)"/i', $attrs, $cm)) {
                    $classes = self::filterClasses($cm[1], ['letter-table', 'no-border-table']);
                    if (!empty($classes)) {
                        $cleanAttrs .= ' class="' . implode(' ', $classes) . '"';
                    }
                }
                if (preg_match('/style\s*=\s*"([^"]*)"/i', $attrs, $sm)) {
                    $allowedStyles = [];
                    if (preg_match('/width\s*:\s*[\d.]+(?:%|px|em)?/i', $sm[1], $wm)) {
                        $allowedStyles[] = trim($wm[0]);
                    }
                    if (preg_match('/text-align\s*:\s*(left|center|right|justify)/i', $sm[1], $am)) {
                        $allowedStyles[] = 'text-align:' . strtolower($am[1]);
                    }
                    if ($tag === 'table') {
                        if (preg_match('/table-layout\s*:\s*(auto|fixed)/i', $sm[1], $tm)) {
                            $allowedStyles[] = 'table-layout:' . strtolower($tm[1]);
                        }
                        if (preg_match('/border-collapse\s*:\s*(collapse|separate)/i', $sm[1], $bm)) {
                            $allowedStyles[] = 'border-collapse:' . strtolower($bm[1]);
                        }
                        if (preg_match('/border\s*:\s*[^;]+/i', $sm[1], $bdm)) {
                            $allowedStyles[] = trim($bdm[0]);
                        }
                    }
                    if (in_array($tag, ['td', 'th'])) {
                        if (preg_match('/vertical-align\s*:\s*(top|middle|bottom)/i', $sm[1], $vm)) {
                            $allowedStyles[] = 'vertical-align:' . strtolower($vm[1]);
                        }
                        if (preg_match('/padding\s*:\s*[\d.]+(?:px|em|%)?/i', $sm[1], $pm)) {
                            $allowedStyles[] = trim($pm[0]);
                        }
                        if (preg_match('/word-wrap\s*:\s*(break-word|normal)/i', $sm[1], $wm)) {
                            $allowedStyles[] = 'word-wrap:' . strtolower($wm[1]);
                        }
                        if (preg_match('/white-space\s*:\s*(normal|nowrap|pre)/i', $sm[1], $wsm)) {
                            $allowedStyles[] = 'white-space:' . strtolower($wsm[1]);
                        }
                        if (preg_match('/border\s*:\s*[^;]+/i', $sm[1], $bdm)) {
                            $allowedStyles[] = trim($bdm[0]);
                        }
                    }
                    if (!empty($allowedStyles)) {
                        $cleanAttrs .= ' style="' . implode('; ', $allowedStyles) . '"';
                    }
                }
                if (in_array($tag, ['td', 'th'])) {
                    if (preg_match('/colspan\s*=\s*"(\d+)"/i', $attrs, $cm)) {
                        $cleanAttrs .= ' colspan="' . (int)$cm[1] . '"';
                    }
                    if (preg_match('/rowspan\s*=\s*"(\d+)"/i', $attrs, $cm)) {
                        $cleanAttrs .= ' rowspan="' . (int)$cm[1] . '"';
                    }
                }
                if (preg_match('/width\s*=\s*"([^"]*)"/i', $attrs, $wam)) {
                    $cleanAttrs .= ' width="' . htmlspecialchars($wam[1], ENT_QUOTES) . '"';
                }
            }

            if (in_array($tag, ['tbody', 'tr'])) {
                if (preg_match('/class\s*=\s*"([^"]*)"/i', $attrs, $cm)) {
                    $classValue = trim(preg_replace('/\s+/', ' ', $cm[1]));
                    if ($classValue !== '') {
                        $cleanAttrs .= ' class="' . $classValue . '"';
                    }
                }
            }

            return '<' . $tag . $cleanAttrs . '>';
        }, $html);

        $html = preg_replace('/\s+/', ' ', $html);
        $html = str_replace('> <', '><', $html);

        return trim($html);
    }

    /**
     * Ensure every table cell has explicit width from colgroup, for DomPDF compatibility.
     */
    public static function normalizeAttachmentTablesForPdf(?string $html): string
    {
        if ($html === null || $html === '') {
            return '';
        }

        return preg_replace_callback('/<table\b[^>]*>.*?<\/table>/is', function ($tableMatch) {
            $table = $tableMatch[0];

            // 1. Extract colgroup widths
            $widths = [];
            if (preg_match('/<colgroup[^>]*>(.*?)<\/colgroup>/is', $table, $cgMatch)) {
                preg_match_all('/<col\b[^>]*>/i', $cgMatch[1], $colTags);
                foreach ($colTags[0] as $colTag) {
                    $w = null;
                    if (preg_match('/style\s*=\s*"([^"]*)"/i', $colTag, $sm) && preg_match('/width\s*:\s*([\d.]+%)/i', $sm[1], $wm)) {
                        $w = $wm[1];
                    }
                    if (!$w && preg_match('/width\s*=\s*"([^"]*)"/i', $colTag, $wam)) {
                        $w = $wam[1];
                    }
                    if ($w) {
                        $widths[] = $w;
                    }
                }
            }

            // 2. Fallback: read widths from first row cells
            if (empty($widths)) {
                if (preg_match('/<tr\b[^>]*>(.*?)<\/tr>/is', $table, $firstRow)) {
                    preg_match_all('/<(td|th)\b[^>]*>/i', $firstRow[1], $cells);
                    foreach ($cells[0] as $cellTag) {
                        $w = null;
                        if (preg_match('/style\s*=\s*"([^"]*)"/i', $cellTag, $sm) && preg_match('/width\s*:\s*([\d.]+%)/i', $sm[1], $wm)) {
                            $w = $wm[1];
                        }
                        if (!$w && preg_match('/width\s*=\s*"([^"]*)"/i', $cellTag, $wam)) {
                            $w = $wam[1];
                        }
                        if ($w) {
                            $widths[] = $w;
                        }
                    }
                }
            }

            $hasWidths = !empty($widths);

            // 3. Ensure table has table-layout:fixed, border-collapse:collapse (preserve existing width)
            $table = preg_replace_callback('/<table\b([^>]*)>/i', function ($tMatch) {
                $attrs = trim($tMatch[1]);
                $parts = [];
                $newAttrs = $attrs;
                if (preg_match('/style\s*=\s*"([^"]*)"/i', $attrs, $sm)) {
                    $existing = $sm[1];
                    if (!preg_match('/table-layout\s*:/i', $existing)) { $parts[] = 'table-layout:fixed'; }
                    if (!preg_match('/border-collapse\s*:/i', $existing)) { $parts[] = 'border-collapse:collapse'; }
                    if (!preg_match('/(?<!border-)border\s*:\s*[^;]+/i', $existing)) { $parts[] = 'border:1px solid #000'; }
                    $parts[] = $existing;
                    $newAttrs = preg_replace('/style\s*=\s*"[^"]*"/i', '', $attrs);
                } else {
                    $parts = ['table-layout:fixed', 'border-collapse:collapse', 'border:1px solid #000'];
                }
                return '<table ' . trim($newAttrs) . ' style="' . implode('; ', $parts) . '">';
            }, $table);

            // 4. Split by rows and apply widths to cells
            $segments = preg_split('/(<tr\b[^>]*>|<\/tr>)/i', $table, -1, PREG_SPLIT_DELIM_CAPTURE);
            $result = '';
            $colIndex = 0;
            $inRow = false;

            foreach ($segments as $seg) {
                if ($seg === '' || $seg === null) continue;
                if (preg_match('/^<tr\b[^>]*>$/i', $seg)) {
                    $result .= $seg;
                    $colIndex = 0;
                    $inRow = true;
                } elseif (preg_match('/^<\/tr>$/i', $seg)) {
                    $result .= $seg;
                    $inRow = false;
                } elseif ($inRow) {
                    $result .= preg_replace_callback('/<(td|th)\b([^>]*)>/i', function ($m) use ($widths, $hasWidths, &$colIndex) {
                        $tag = $m[1];
                        $attrs = $m[2];

                        $colspan = 1;
                        if (preg_match('/colspan\s*=\s*"(\d+)"/i', $attrs, $cm)) {
                            $colspan = max(1, (int)$cm[1]);
                        }

                        $w = null;
                        if ($hasWidths) {
                            $ci = $colIndex % count($widths);
                            $w = $widths[$ci];
                        }
                        $colIndex += $colspan;

                        $clean = '';

                        if (preg_match('/style\s*=\s*"([^"]*)"/i', $attrs, $sm)) {
                            $existing = $sm[1];
                            if ($w && !preg_match('/width\s*:/i', $existing)) {
                                $existing = 'width:' . $w . '; ' . $existing;
                            }
                            if (!preg_match('/vertical-align\s*:/i', $existing)) {
                                $existing = $existing . '; vertical-align:top';
                            }
                            if (!preg_match('/(?<!border-)border\s*:\s*[^;]+/i', $existing)) {
                                $existing = $existing . '; border:1px solid #000';
                            }
                            if (!preg_match('/padding\s*:/i', $existing)) {
                                $existing = $existing . '; padding:6px';
                            }
                            $clean .= ' style="' . $existing . '"';
                        } else {
                            $styleParts = [];
                            if ($w) { $styleParts[] = 'width:' . $w; }
                            $styleParts[] = 'vertical-align:top';
                            $styleParts[] = 'border:1px solid #000';
                            $styleParts[] = 'padding:6px';
                            $clean .= ' style="' . implode('; ', $styleParts) . '"';
                        }

                        if ($w && !preg_match('/width\s*=\s*"([^"]*)"/i', $attrs)) {
                            $clean .= ' width="' . $w . '"';
                        }

                        if (preg_match('/colspan\s*=\s*"(\d+)"/i', $attrs, $cm)) {
                            $clean .= ' colspan="' . (int)$cm[1] . '"';
                        }
                        if (preg_match('/rowspan\s*=\s*"(\d+)"/i', $attrs, $cm)) {
                            $clean .= ' rowspan="' . (int)$cm[1] . '"';
                        }

                        return '<' . $tag . $clean . '>';
                    }, $seg);
                } else {
                    $result .= $seg;
                }
            }

            return $result;
        }, $html);
    }

    public static function render(?string $html): string
    {
        if ($html === null || $html === '') {
            return '';
        }

        $allowedTagPattern = '/<(p|br|strong|b|em|i|u|ol|ul|li|figure|table|thead|tbody|tfoot|tr|th|td|colgroup|col|div|span)[\s>]/i';
        if (!preg_match($allowedTagPattern, $html)) {
            return self::toDisplayHtml($html);
        }

        return self::sanitize($html);
    }

    public static function toDisplayHtml(?string $text): string
    {
        if ($text === null || $text === '') {
            return '';
        }

        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');

        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = preg_replace("/\n{3,}/", "\n\n", $text);
        $text = trim($text);

        if ($text === '') {
            return '';
        }

        $paragraphs = preg_split('/\n\s*\n/', $text);
        $parts = [];

        foreach ($paragraphs as $para) {
            $para = trim($para);
            if ($para === '') {
                continue;
            }

            $lines = explode("\n", $para);
            $escapedLines = array_map(function ($line) {
                return htmlspecialchars($line, ENT_QUOTES, 'UTF-8');
            }, $lines);

            $parts[] = '<p>' . implode('<br>', $escapedLines) . '</p>';
        }

        return implode("\n", $parts);
    }

    private static function filterClasses(string $classValue, array $allowedClasses): array
    {
        $allowed = array_flip($allowedClasses);
        $classes = preg_split('/\s+/', trim($classValue)) ?: [];

        return array_values(array_filter(array_unique($classes), function ($class) use ($allowed) {
            return isset($allowed[$class]);
        }));
    }
}
