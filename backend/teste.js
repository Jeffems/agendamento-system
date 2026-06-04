import bcrypt from "bcrypt";

console.log("bcrypt carregado");

const hash = await bcrypt.hash("96132949Jefer", 12);
console.log(hash);