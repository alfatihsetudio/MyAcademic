<?php

namespace Tests\Unit;

use App\Helpers\LetterHtmlSanitizer;
use PHPUnit\Framework\TestCase;

class LetterHtmlSanitizerPdfTest extends TestCase
{
    public function test_empty_input_returns_empty(): void
    {
        $this->assertSame('', LetterHtmlSanitizer::normalizeAttachmentTablesForPdf(''));
        $this->assertSame('', LetterHtmlSanitizer::normalizeAttachmentTablesForPdf(null));
    }

    public function test_table_with_colgroup_gets_inline_borders(): void
    {
        $html = '<table><colgroup><col style="width:30%"><col style="width:70%"></colgroup>'
            . '<tr><td>A</td><td>B</td></tr></table>';

        $result = LetterHtmlSanitizer::normalizeAttachmentTablesForPdf($html);

        $this->assertStringContainsString('border:1px solid #000', $result);
        $this->assertStringContainsString('border-collapse:collapse', $result);
        $this->assertMatchesRegularExpression('/<td[^>]+style="[^"]*border:1px solid #000[^"]*"/', $result);
    }

    public function test_table_without_widths_still_gets_inline_borders(): void
    {
        $html = '<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>';

        $result = LetterHtmlSanitizer::normalizeAttachmentTablesForPdf($html);

        $this->assertStringContainsString('border:1px solid #000', $result);
        $this->assertMatchesRegularExpression('/<td[^>]+style="[^"]*border:1px solid #000[^"]*"/', $result);
        $this->assertMatchesRegularExpression('/<td[^>]+style="[^"]*padding:6px[^"]*"/', $result);
        $this->assertMatchesRegularExpression('/<td[^>]+style="[^"]*vertical-align:top[^"]*"/', $result);
    }

    public function test_table_without_widths_gets_no_width_attribute(): void
    {
        $html = '<table><tr><td>A</td></tr></table>';

        $result = LetterHtmlSanitizer::normalizeAttachmentTablesForPdf($html);

        $this->assertStringNotContainsString('width="', $result);
    }

    public function test_table_with_colgroup_gets_width_on_cells(): void
    {
        $html = '<table><colgroup><col style="width:40%"><col style="width:60%"></colgroup>'
            . '<tr><td>X</td><td>Y</td></tr></table>';

        $result = LetterHtmlSanitizer::normalizeAttachmentTablesForPdf($html);

        $this->assertStringContainsString('width="40%"', $result);
        $this->assertStringContainsString('width="60%"', $result);
    }

    public function test_preserves_existing_border_style(): void
    {
        $html = '<table><colgroup><col style="width:50%"><col style="width:50%"></colgroup>'
            . '<tr><td style="border:2px solid red">A</td><td>B</td></tr></table>';

        $result = LetterHtmlSanitizer::normalizeAttachmentTablesForPdf($html);

        $this->assertStringContainsString('border:2px solid red', $result);
        $this->assertStringNotContainsString('border:2px solid red; border:1px solid #000', $result);
    }

    public function test_table_with_no_border_class_still_gets_borders(): void
    {
        $html = '<table class="no-border-table"><colgroup><col style="width:50%"><col style="width:50%"></colgroup>'
            . '<tr><td>A</td><td>B</td></tr></table>';

        $result = LetterHtmlSanitizer::normalizeAttachmentTablesForPdf($html);

        $this->assertStringContainsString('border:1px solid #000', $result);
    }

    public function test_preserves_colspan_and_rowspan(): void
    {
        $html = '<table><colgroup><col style="width:33%"><col style="width:33%"><col style="width:34%"></colgroup>'
            . '<tr><td colspan="2">Wide</td><td>Narrow</td></tr></table>';

        $result = LetterHtmlSanitizer::normalizeAttachmentTablesForPdf($html);

        $this->assertStringContainsString('colspan="2"', $result);
    }

    public function test_multiple_tables_are_all_processed(): void
    {
        $html = '<table><tr><td>A</td></tr></table>'
            . '<p>Between</p>'
            . '<table><tr><td>B</td></tr></table>';

        $result = LetterHtmlSanitizer::normalizeAttachmentTablesForPdf($html);

        preg_match_all('/border:1px solid #000/', $result, $matches);
        $this->assertCount(4, $matches[0]);
    }

    public function test_th_elements_also_get_borders(): void
    {
        $html = '<table><tr><th>Header 1</th><th>Header 2</th></tr>'
            . '<tr><td>Data 1</td><td>Data 2</td></tr></table>';

        $result = LetterHtmlSanitizer::normalizeAttachmentTablesForPdf($html);

        $this->assertMatchesRegularExpression('/<th[^>]+style="[^"]*border:1px solid #000[^"]*"/', $result);
        $this->assertMatchesRegularExpression('/<td[^>]+style="[^"]*border:1px solid #000[^"]*"/', $result);
    }

    public function test_preserves_existing_padding_on_cell(): void
    {
        $html = '<table><colgroup><col style="width:100%"></colgroup>'
            . '<tr><td style="padding:10px">A</td></tr></table>';

        $result = LetterHtmlSanitizer::normalizeAttachmentTablesForPdf($html);

        $this->assertStringContainsString('padding:10px', $result);
        $this->assertStringNotContainsString('padding:6px', $result);
    }
}
