import {definePreset} from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const AddInTheme = definePreset(Aura, {
  //Your customizations, see the following sections for examples
  primitive: {
    slate: {
      100: '#f5f5f5'
    },
    blue: {
      100: '#D4E7FC',
      200: '#AACDF9',
      300: '#7DACEE',
      400: '#5A8CDE',
      500: '#2A60C8',
      600: '#1E4AAC',
      700: '#153690',
      800: '#153690',
      900: '#081960',
    }
  },
  semantic: {
    disabledOpacity: '0.4',
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}'
    }
  },
  components: {
    tabs: {}
  }
});
//#2a60c8
