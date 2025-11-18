-- CreateEnum
CREATE TYPE "Situation" AS ENUM ('EM_ANDAMENTO', 'FINALIZADO', 'ATRASADO');

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "situation" "Situation" DEFAULT 'EM_ANDAMENTO';
