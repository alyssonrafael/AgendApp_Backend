import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from './services/authService';
// intancia separada do prisma
const prisma = new PrismaClient();

async function main() {
  const userIds = [uuidv4(), uuidv4(), uuidv4()];
  const empresaIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
  const servicoIds = Array.from({ length: 40 }, () => uuidv4()); // 10 serviços para cada empresa (4 empresas)
  const agendamentoIds = Array.from({ length: 20 }, () => uuidv4()); //20 ids sobrando
  const indisponibilidadeIds = [uuidv4(), uuidv4()];

  // 1. Criar usuários (clientes)
  await prisma.user.createMany({
    data: [
      {
        id: userIds[0],
        email: 'cliente1@email.com',
        name: 'João Silva',
        phoneNumber: '11987654321',
        password: await hashPassword("123456")
      },
      {
        id: userIds[1],
        email: 'cliente2@email.com',
        name: 'Maria Souza',
        googleId: 'google123',
        phoneNumber: '21988776655',
      },
      {
        id: userIds[2],
        email: 'cliente3@email.com',
        name: 'Carlos Oliveira',
        phoneNumber: '31999887766',
        password: await hashPassword("123456")
      }
    ],
    skipDuplicates: true,
  });

  // 2. Criar empresas
  await prisma.empresa.createMany({
    data: [
      {
        id: empresaIds[0],
        email: 'barbearia@email.com',
        password: await hashPassword("123456"),
        name: 'Barbeiro João',
        nomeEmpresa: 'Barbearia Elegance',
        phoneNumber: '1133334444',
        address: 'Rua das Barbas, 123 - São Paulo',
        description: 'Barbearia premium com 10 anos de experiência'
      },
      {
        id: empresaIds[1],
        email: 'salao@email.com',
        password: await hashPassword("123456"),
        name: 'Cabeleireira Ana',
        nomeEmpresa: 'Salão Beauty',
        phoneNumber: '2144445555',
        address: 'Av. dos Cabelos, 456 - Rio de Janeiro',
        description: 'Especializado em coloração e tratamentos'
      },
      {
        id: empresaIds[2],
        email: 'petshop@email.com',
        password: await hashPassword("123456"),
        name: 'Carlos Pet',
        nomeEmpresa: 'PetShop HappyPets',
        phoneNumber: '3133332222',
        address: 'Rua dos Animais, 321 - Belo Horizonte',
        description: 'Cuidados completos para seu pet, com banho, tosa e consultas'
      },
      {
        id: empresaIds[3],
        email: 'clinicaestetica@email.com',
        password: await hashPassword("123456"),
        name: 'Esteticista Paula',
        nomeEmpresa: 'Clínica de Estética Paula',
        phoneNumber: '1122223333',
        address: 'Av. da Beleza, 654 - Campinas',
        description: 'Tratamentos estéticos faciais e corporais de alta qualidade'
      }
    ],
    skipDuplicates: true,
  });

  // 3. Criar serviços
  await prisma.servico.createMany({
    data: [
      // Serviços Barbearia Elegance
      { id: servicoIds[0], nome: 'Corte de Cabelo', descricao: 'Corte moderno com técnicas atualizadas', duracao: 30, custo: 50.00, empresaId: empresaIds[0] },
      { id: servicoIds[1], nome: 'Barba', descricao: 'Barba feita com toalha quente', duracao: 45, custo: 40.00, empresaId: empresaIds[0] },
      { id: servicoIds[2], nome: 'Sobrancelha', descricao: 'Design de sobrancelha masculino', duracao: 15, custo: 25.00, empresaId: empresaIds[0] },
      { id: servicoIds[3], nome: 'Corte Máquina', descricao: 'Corte total com máquina', duracao: 20, custo: 30.00, empresaId: empresaIds[0] },
      { id: servicoIds[4], nome: 'Hidratação Capilar', descricao: 'Hidratação para cabelos secos', duracao: 40, custo: 70.00, empresaId: empresaIds[0] },
      { id: servicoIds[5], nome: 'Luzes Masculinas', descricao: 'Mechas discretas', duracao: 90, custo: 200.00, empresaId: empresaIds[0] },
      { id: servicoIds[6], nome: 'Platinado', descricao: 'Descoloração total dos fios', duracao: 120, custo: 250.00, empresaId: empresaIds[0] },
      { id: servicoIds[7], nome: 'Progressiva', descricao: 'Alisamento de cabelo masculino', duracao: 120, custo: 300.00, empresaId: empresaIds[0] },
      { id: servicoIds[8], nome: 'Pezinho', descricao: 'Ajuste de corte', duracao: 10, custo: 15.00, empresaId: empresaIds[0] },
      { id: servicoIds[9], nome: 'Tratamento Anti-queda', descricao: 'Fortalecimento capilar', duracao: 45, custo: 90.00, empresaId: empresaIds[0] },

      // Serviços Salão Beauty
      { id: servicoIds[10], nome: 'Coloração', descricao: 'Coloração profissional com produtos premium', duracao: 120, custo: 180.00, empresaId: empresaIds[1] },
      { id: servicoIds[11], nome: 'Manicure', descricao: 'Manicure completa com esmaltação', duracao: 60, custo: 70.00, empresaId: empresaIds[1] },
      { id: servicoIds[12], nome: 'Pedicure', descricao: 'Pedicure completa', duracao: 60, custo: 75.00, empresaId: empresaIds[1] },
      { id: servicoIds[13], nome: 'Corte Feminino', descricao: 'Corte moderno para mulheres', duracao: 45, custo: 80.00, empresaId: empresaIds[1] },
      { id: servicoIds[14], nome: 'Hidratação Capilar', descricao: 'Tratamento profundo para cabelos', duracao: 60, custo: 120.00, empresaId: empresaIds[1] },
      { id: servicoIds[15], nome: 'Escova Modelada', descricao: 'Modelagem de cabelo com escova', duracao: 50, custo: 90.00, empresaId: empresaIds[1] },
      { id: servicoIds[16], nome: 'Maquiagem', descricao: 'Maquiagem para eventos', duracao: 90, custo: 150.00, empresaId: empresaIds[1] },
      { id: servicoIds[17], nome: 'Design de Sobrancelhas', descricao: 'Sobrancelhas perfeitas', duracao: 30, custo: 40.00, empresaId: empresaIds[1] },
      { id: servicoIds[18], nome: 'Depilação', descricao: 'Depilação com cera', duracao: 60, custo: 100.00, empresaId: empresaIds[1] },
      { id: servicoIds[19], nome: 'Tratamento Antifrizz', descricao: 'Eliminação de frizz', duracao: 90, custo: 170.00, empresaId: empresaIds[1] },

      // Serviços PetShop HappyPets
      { id: servicoIds[20], nome: 'Banho Simples', descricao: 'Banho para cães de pequeno porte', duracao: 40, custo: 60.00, empresaId: empresaIds[2] },
      { id: servicoIds[21], nome: 'Banho e Tosa', descricao: 'Banho e tosa higiênica', duracao: 90, custo: 120.00, empresaId: empresaIds[2] },
      { id: servicoIds[22], nome: 'Corte de Unhas', descricao: 'Corte de unhas para pets', duracao: 15, custo: 25.00, empresaId: empresaIds[2] },
      { id: servicoIds[23], nome: 'Limpeza de Ouvido', descricao: 'Higienização dos ouvidos', duracao: 20, custo: 30.00, empresaId: empresaIds[2] },
      { id: servicoIds[24], nome: 'Hidratação de Pelagem', descricao: 'Hidratação para pelagem', duracao: 60, custo: 90.00, empresaId: empresaIds[2] },
      { id: servicoIds[25], nome: 'Escovação de Dentes', descricao: 'Higiene bucal para pets', duracao: 30, custo: 40.00, empresaId: empresaIds[2] },
      { id: servicoIds[26], nome: 'Consulta Veterinária', descricao: 'Consulta de rotina', duracao: 30, custo: 150.00, empresaId: empresaIds[2] },
      { id: servicoIds[27], nome: 'Vacinação', descricao: 'Aplicação de vacinas', duracao: 20, custo: 80.00, empresaId: empresaIds[2] },
      { id: servicoIds[28], nome: 'Tosa Bebê', descricao: 'Tosa para filhotes', duracao: 60, custo: 100.00, empresaId: empresaIds[2] },
      { id: servicoIds[29], nome: 'Adestramento Básico', descricao: 'Treinamento inicial', duracao: 120, custo: 250.00, empresaId: empresaIds[2] },

      // Serviços Clínica de Estética Paula
      { id: servicoIds[30], nome: 'Limpeza de Pele', descricao: 'Remoção de impurezas da pele', duracao: 90, custo: 200.00, empresaId: empresaIds[3] },
      { id: servicoIds[31], nome: 'Peeling Químico', descricao: 'Renovação celular', duracao: 60, custo: 300.00, empresaId: empresaIds[3] },
      { id: servicoIds[32], nome: 'Massagem Relaxante', descricao: 'Massagem antiestresse', duracao: 60, custo: 180.00, empresaId: empresaIds[3] },
      { id: servicoIds[33], nome: 'Drenagem Linfática', descricao: 'Estimulação do sistema linfático', duracao: 60, custo: 220.00, empresaId: empresaIds[3] },
      { id: servicoIds[34], nome: 'Tratamento de Acne', descricao: 'Tratamento especializado', duracao: 60, custo: 250.00, empresaId: empresaIds[3] },
      { id: servicoIds[35], nome: 'Micropigmentação', descricao: 'Micropigmentação de sobrancelhas', duracao: 120, custo: 400.00, empresaId: empresaIds[3] },
      { id: servicoIds[36], nome: 'Depilação a Laser', descricao: 'Depilação permanente', duracao: 60, custo: 500.00, empresaId: empresaIds[3] },
      { id: servicoIds[37], nome: 'Rejuvenescimento Facial', descricao: 'Tratamento anti-idade', duracao: 90, custo: 600.00, empresaId: empresaIds[3] },
      { id: servicoIds[38], nome: 'Criolipólise', descricao: 'Redução de gordura localizada', duracao: 120, custo: 800.00, empresaId: empresaIds[3] },
      { id: servicoIds[39], nome: 'Tratamento de Estrias', descricao: 'Melhora da aparência da pele', duracao: 90, custo: 550.00, empresaId: empresaIds[3] },
    ],
    skipDuplicates: true,
  });

  // 4. Criar grades de horário
  await prisma.gradeHorario.createMany({
    data: [
      // Barbearia - Segunda a Sexta
      { id: uuidv4(), diaSemana: 1, inicio: '08:00', fim: '18:00', intervalo: 30, empresaId: empresaIds[0] },
      { id: uuidv4(), diaSemana: 2, inicio: '08:00', fim: '18:00', intervalo: 30, empresaId: empresaIds[0] },
      { id: uuidv4(), diaSemana: 3, inicio: '08:00', fim: '18:00', intervalo: 30, empresaId: empresaIds[0] },
      { id: uuidv4(), diaSemana: 4, inicio: '08:00', fim: '18:00', intervalo: 30, empresaId: empresaIds[0] },
      { id: uuidv4(), diaSemana: 5, inicio: '08:00', fim: '18:00', intervalo: 30, empresaId: empresaIds[0] },
      
      // Salão - Terça a Sábado
      { id: uuidv4(), diaSemana: 2, inicio: '09:00', fim: '19:00', intervalo: 60, empresaId: empresaIds[1] },
      { id: uuidv4(), diaSemana: 3, inicio: '09:00', fim: '19:00', intervalo: 60, empresaId: empresaIds[1] },
      { id: uuidv4(), diaSemana: 4, inicio: '09:00', fim: '19:00', intervalo: 60, empresaId: empresaIds[1] },
      { id: uuidv4(), diaSemana: 5, inicio: '09:00', fim: '19:00', intervalo: 60, empresaId: empresaIds[1] },
      { id: uuidv4(), diaSemana: 6, inicio: '09:00', fim: '17:00', intervalo: 60, empresaId: empresaIds[1] },

      // Clínica Estética - Segunda, Quarta e Sexta
      { id: uuidv4(), diaSemana: 1, inicio: '10:00', fim: '17:00', intervalo: 45, empresaId: empresaIds[2] },
      { id: uuidv4(), diaSemana: 3, inicio: '10:00', fim: '17:00', intervalo: 45, empresaId: empresaIds[2] },
      { id: uuidv4(), diaSemana: 5, inicio: '10:00', fim: '17:00', intervalo: 45, empresaId: empresaIds[2] },

      // Petshop - Terça a Domingo
      { id: uuidv4(), diaSemana: 2, inicio: '09:00', fim: '17:00', intervalo: 30, empresaId: empresaIds[3] },
      { id: uuidv4(), diaSemana: 3, inicio: '09:00', fim: '17:00', intervalo: 30, empresaId: empresaIds[3] },
      { id: uuidv4(), diaSemana: 4, inicio: '09:00', fim: '17:00', intervalo: 30, empresaId: empresaIds[3] },
      { id: uuidv4(), diaSemana: 5, inicio: '09:00', fim: '17:00', intervalo: 30, empresaId: empresaIds[3] },
      { id: uuidv4(), diaSemana: 6, inicio: '09:00', fim: '15:00', intervalo: 30, empresaId: empresaIds[3] },
      { id: uuidv4(), diaSemana: 0, inicio: '10:00', fim: '14:00', intervalo: 30, empresaId: empresaIds[3] },
    ],
    skipDuplicates: true,
  });

  // 5. Criar agendamentos
  await prisma.agendamento.createMany({
    data: [
      {
        id: agendamentoIds[0],
        data: new Date('2025-08-01T00:00:00Z'),
        horario: '09:30',
        clienteId: userIds[0],
        servicoId: servicoIds[Math.floor(Math.random() * 40)] 
      },
      {
        id: agendamentoIds[1],
        data: new Date('2025-08-01T00:00:00Z'),
        horario: '10:00',
        clienteId: userIds[1],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[2],
        data: new Date('2025-08-01T00:00:00Z'),
        horario: '10:30',
        clienteId: userIds[2],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[3],
        data: new Date('2025-08-02T00:00:00Z'),
        horario: '09:00',
        clienteId: userIds[0],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[4],
        data: new Date('2025-08-02T00:00:00Z'),
        horario: '14:00',
        clienteId: userIds[1],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[5],
        data: new Date('2025-08-03T00:00:00Z'),
        horario: '10:30',
        clienteId: userIds[2],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[6],
        data: new Date('2025-08-03T00:00:00Z'),
        horario: '11:00',
        clienteId: userIds[0],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[7],
        data: new Date('2025-08-04T00:00:00Z'),
        horario: '09:00',
        clienteId: userIds[1],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[8],
        data: new Date('2025-08-04T00:00:00Z'),
        horario: '11:00',
        clienteId: userIds[2],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[9],
        data: new Date('2025-08-05T00:00:00Z'),
        horario: '09:30',
        clienteId: userIds[0],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[10],
        data: new Date('2025-08-05T00:00:00Z'),
        horario: '14:30',
        clienteId: userIds[1],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[11],
        data: new Date('2025-08-06T00:00:00Z'),
        horario: '16:00',
        clienteId: userIds[2],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[12],
        data: new Date('2025-08-06T00:00:00Z'),
        horario: '10:00',
        clienteId: userIds[0],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[13],
        data: new Date('2025-08-07T00:00:00Z'),
        horario: '11:00',
        clienteId: userIds[1],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[14],
        data: new Date('2025-08-07T00:00:00Z'),
        horario: '14:30',
        clienteId: userIds[2],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[15],
        data: new Date('2025-08-08T00:00:00Z'),
        horario: '09:00',
        clienteId: userIds[0],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[16],
        data: new Date('2025-08-08T00:00:00Z'),
        horario: '10:30',
        clienteId: userIds[1],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[17],
        data: new Date('2025-08-09T00:00:00Z'),
        horario: '11:00',
        clienteId: userIds[2],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[18],
        data: new Date('2025-08-09T00:00:00Z'),
        horario: '14:00',
        clienteId: userIds[0],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      },
      {
        id: agendamentoIds[19],
        data: new Date('2025-08-10T00:00:00Z'),
        horario: '16:00',
        clienteId: userIds[1],
        servicoId: servicoIds[Math.floor(Math.random() * 40)]
      }
    ], 
    skipDuplicates: true,
  });

  // 6. Criar indisponibilidades
  await prisma.indisponibilidade.createMany({
    data: [
      {
        id: indisponibilidadeIds[0],
        data: new Date('2025-06-20T00:00:00Z'),
        horario: '12:00-13:00',
        empresaId: empresaIds[0],
        motivo: 'Almoço prolongado'
      },
      {
        id: indisponibilidadeIds[1],
        data: null, // Indisponibilidade recorrente
        horario: '15:00-15:30',
        empresaId: empresaIds[1],
        motivo: 'Reunião de equipe'
      }
    ],
    skipDuplicates: true,
  });

  console.log('Seed concluído com sucesso!');
  console.log("Credenciais:",{
    clientes: [
      { email: "cliente1@email.com", senha: "123456" },
      { email: "cliente2@email.com", senha: "123456" },
      { email: "cliente3@email.com", senha: "123456" },
    ],
    empresa:[
      { email: "barbearia@email.com", senha: "123456" },
      { email: "salao@email.com", senha: "123456" },
      { email: "petshop@email.com", senha: "123456" },
      { email: "clinicaestetica@email.com", senha: "123456" },
    ]
  } )
}

main()
// em caso de erro
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  // fina;iza conecxao
  .finally(async () => {
    await prisma.$disconnect();
  });