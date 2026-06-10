import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import '@mdi/font/css/materialdesignicons.css'

const darkTheme = {
  dark: true,
  colors: {
    background: '#1A1C1C',
    surface: '#333535',
    primary: '#E9C176',
    secondary: '#D1C5B4',
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
  theme: {
    defaultTheme: 'darkTheme',
    themes: {
      darkTheme,
    },
  },
})
