import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "argoneditz@gmail.com";
  const newPassword = "test";
  
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log("Success:", result);
  } catch (error) {
    console.error("Error updating:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
