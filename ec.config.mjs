// @ts-check
// Expressive Code: frames, copy button, line markers, diffs, collapsible ranges
// and line numbers, themed in the site's own inks so code sits on the paper.
import { defineEcConfig, ExpressiveCodeTheme } from 'astro-expressive-code'
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

const ink = '#11135a', blue = '#020887', fn = '#2233b8', mauve = '#795663', soft = '#5a5a9a'
const paper = new ExpressiveCodeTheme({
  name: 'lunalgia-paper',
  type: 'light',
  colors: { 'editor.background': '#00000000', 'editor.foreground': ink },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: soft, fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'keyword.operator.word'], settings: { foreground: blue } },
    { scope: ['string', 'constant', 'constant.numeric', 'constant.character'], settings: { foreground: mauve } },
    { scope: ['entity.name.function', 'support.function', 'entity.name.type', 'support.type'], settings: { foreground: fn } },
    { scope: ['punctuation', 'keyword.operator'], settings: { foreground: soft } },
    { scope: ['variable', 'variable.parameter'], settings: { foreground: ink } },
  ],
})

export default defineEcConfig({
  themes: [paper],
  useDarkModeMediaQuery: false,
  plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
  minSyntaxHighlightingColorContrast: 0,
  defaultProps: { showLineNumbers: false, wrap: false },
  styleOverrides: {
    borderRadius: '0',
    borderWidth: '0',
    borderColor: 'rgb(2 8 135 / 0.35)',
    codeBackground: 'transparent',
    codeFontFamily: "'JetBrains Mono', ui-monospace, monospace",
    codeFontSize: '0.86rem',
    codeLineHeight: '1.65',
    codePaddingInline: '1.1rem',
    uiFontFamily: "'DINdong', 'Instrument Serif', serif",
    uiFontSize: '0.66rem',
    focusBorder: blue,
    scrollbarThumbColor: 'rgb(2 8 135 / 0.3)',
    scrollbarThumbHoverColor: 'rgb(2 8 135 / 0.5)',
    frames: {
      shadowColor: 'transparent',
      frameBoxShadowCssValue: 'none',
      editorBackground: 'transparent',
      terminalBackground: 'transparent',
      editorTabBarBackground: 'transparent',
      editorActiveTabBackground: 'transparent',
      editorActiveTabForeground: blue,
      editorActiveTabIndicatorTopColor: 'transparent',
      editorActiveTabIndicatorBottomColor: blue,
      editorTabBarBorderBottomColor: 'rgb(2 8 135 / 0.2)',
      terminalTitlebarBackground: 'transparent',
      terminalTitlebarForeground: blue,
      terminalTitlebarBorderBottomColor: 'rgb(2 8 135 / 0.2)',
      terminalTitlebarDotsForeground: 'rgb(2 8 135 / 0.35)',
      inlineButtonForeground: blue,
      inlineButtonBorder: blue,
      inlineButtonBackground: blue,
      tooltipSuccessBackground: blue,
    },
    textMarkers: {
      markBackground: 'rgb(2 8 135 / 0.08)',
      markBorderColor: blue,
      insBackground: 'rgb(34 51 184 / 0.1)',
      insBorderColor: fn,
      insDiffIndicatorColor: fn,
      delBackground: 'rgb(121 86 99 / 0.12)',
      delBorderColor: mauve,
      delDiffIndicatorColor: mauve,
    },
    collapsibleSections: {
      closedBackgroundColor: 'rgb(2 8 135 / 0.06)',
      closedBorderColor: 'rgb(2 8 135 / 0.25)',
      closedTextColor: blue,
      openBackgroundColorCollapsible: 'transparent',
      openBorderColor: 'rgb(2 8 135 / 0.25)',
    },
    lineNumbers: { foreground: 'rgb(90 90 154 / 0.6)', highlightForeground: blue },
  },
})
