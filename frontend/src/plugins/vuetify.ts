import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { pt } from 'vuetify/locale'

import '@mdi/font/css/materialdesignicons.css'

const theme = {
  dark: false,
  colors: {
    background: '#F5F5F5',
    surface: '#F5F5F5',
    primary: '#111111',
    secondary: '#C9A84C',
    'brown-dark': '#412D00',
    'brown-muted': '#4E4639',
    error: '#CF6679',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
}

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'pt',
    messages: { pt },
  },
  date: {
    locale: {
      pt: 'pt-BR',
    },
  },
  theme: {
    defaultTheme: 'theme',
    themes: {
      theme,
    },
  },
})
