import swaggerJSDoc, { Options } from 'swagger-jsdoc'

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TDBO - API',
      version: '1.0.0',
      description: 'Documentación interactiva de la API para gestionar gastos de viaje compartidos',
    },
    servers: [
      {
        url: `http://localhost:${process.env.APP_PORT || 3000}/api`,
        description: 'Dev',
      },
    ],
    tags: [
      {
        name: 'Autenticación',
        description: '',
      },
      {
        name: 'Viajes/Grupos',
      },
      {
        name: 'Gastos',
      },
      {
        name: 'Usuarios',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
}

export const swaggerSpec = swaggerJSDoc(options)
export const swaggerUiOptions = { explorer: true }