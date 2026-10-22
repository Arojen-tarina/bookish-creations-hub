export * from './colors';

export const shapeRadius = { extraSmall: 4, small: 6, medium: 10, large: 14, extraLarge: 20 } as const;
export const typography = {
  displayLarge: { fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 44, lineHeight: '50px', letterSpacing: '1.5px' },
  displayMedium: { fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 34, lineHeight: '40px', letterSpacing: '1px' },
  headlineLarge: { fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 28, lineHeight: '34px', letterSpacing: '.5px' },
  headlineMedium: { fontFamily: 'Cinzel, serif', fontWeight: 600, fontSize: 22, lineHeight: '28px', letterSpacing: '.5px' },
  headlineSmall: { fontFamily: 'Cinzel, serif', fontWeight: 600, fontSize: 18, lineHeight: '24px', letterSpacing: '.5px' },
  titleLarge: { fontWeight: 700, fontSize: 18, lineHeight: '24px' },
  titleMedium: { fontWeight: 600, fontSize: 15, lineHeight: '20px' },
  titleSmall: { fontWeight: 600, fontSize: 13, lineHeight: '18px' },
  bodyLarge: { fontWeight: 400, fontSize: 15, lineHeight: '22px' },
  bodyMedium: { fontWeight: 400, fontSize: 13, lineHeight: '19px' },
  bodySmall: { fontWeight: 400, fontSize: 12, lineHeight: '16px' },
  labelLarge: { fontWeight: 700, fontSize: 14, lineHeight: '18px', letterSpacing: '.5px' },
  labelMedium: { fontWeight: 600, fontSize: 12, lineHeight: '16px', letterSpacing: '.4px' },
  labelSmall: { fontWeight: 600, fontSize: 10, lineHeight: '14px', letterSpacing: '.4px' },
} as const;
export const Cinzel = 'Cinzel, serif';
export const Typography = typography;
