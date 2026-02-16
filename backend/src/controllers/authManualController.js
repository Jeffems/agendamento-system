// Compatibilidade: alguns deploys ainda importam este arquivo antigo.
// Mantemos como re-export para evitar ERR_MODULE_NOT_FOUND.
export {
  register,
  login,
  me,
  acceptTerms,
} from "./authController.js";
