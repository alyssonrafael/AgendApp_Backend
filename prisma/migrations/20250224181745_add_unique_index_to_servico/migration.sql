/*
  Warnings:

  - A unique constraint covering the columns `[nome,empresaId]` on the table `Servico` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Servico_nome_empresaId_key" ON "Servico"("nome", "empresaId");
