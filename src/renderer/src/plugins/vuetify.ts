import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const customLightTheme = {
  dark: false,
  colors: {
    background: '#ffffff',
    surface: '#fafafa',
    'surface-variant': '#f5f5f5',
    primary: '#2196F3',
    secondary: '#757575',
    accent: '#00BCD4',
    error: '#f44336',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FF9800',
    'on-background': '#212121',
    'on-surface': '#212121',
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'customLightTheme',
    themes: {
      customLightTheme
    }
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none;',
      elevation: 0,
    },
    VCard: {
      elevation: 0,
    }
  }
})
