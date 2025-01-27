// Nesse arquivo determinamos uma instancia unica do prisma visando deixar a conecxão mais fluida e nao gerar erros por multiplas instancia e concxões

import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

// instância única se já tiver sido criada, ou criamos uma nova instância
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Em desenvolvimento, reutilizamos a instância para evitar múltiplas conexões 
  globalThis.prisma = globalThis.prisma || new PrismaClient();
  prisma = globalThis.prisma;
}

export default prisma;
