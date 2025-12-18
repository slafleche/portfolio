declare module '@/data/debugRoutes.json' {
  export interface DebugRoutes {
    baseLocale: string;
    pages: string[];
  }

  const debugRoutes: DebugRoutes;
  export default debugRoutes;
}

