import LegalPage from "../components/LegalPage";
import { brand } from "../config/brand";

export default function Termos() {
  const p = (texto) => <p>{texto}</p>;
  return <LegalPage title="Termos de Uso" subtitle={`Versão vigente em ${brand.legalVersion}`} sections={[
    { title: "Identificação", content: <>{p(`Estes Termos regulam o uso do ${brand.name}, oferecido por ${brand.legalName}, documento ${brand.legalDocument}, com endereço em ${brand.legalAddress}. Contato: ${brand.supportEmail}.`)}</> },
    { title: "Objeto do serviço", content: <>{p(`${brand.name} é uma plataforma de gestão de clientes, serviços, horários, lembretes e agendamentos online. A plataforma não presta os serviços anunciados pelos assinantes e não integra a relação de consumo entre o profissional e seu cliente final.`)}</> },
    { title: "Conta e segurança", content: <>{p("O usuário deve fornecer informações verdadeiras, manter sua senha protegida e comunicar qualquer uso não autorizado. Cada conta é destinada ao titular cadastrado, salvo funcionalidade específica para equipes.")}</> },
    { title: "Teste, planos e cobrança", content: <>{p("O teste gratuito dura 14 dias, salvo oferta diferente informada na contratação. Após o teste, o acesso a funcionalidades pagas depende de assinatura ativa. Valores, periodicidade e recursos são apresentados antes da contratação. Pagamentos e gestão de cartão são processados pelo Stripe.")}{p("O cancelamento pode ser solicitado pelo Portal do Cliente e produz efeitos conforme o período já contratado e as condições exibidas no momento da solicitação.")}</> },
    { title: "Uso adequado", content: <>{p("É proibido utilizar a plataforma para atividades ilícitas, envio abusivo de mensagens, violação de direitos, acesso indevido, engenharia reversa ou tentativa de comprometer a disponibilidade e a segurança do serviço.")}</> },
    { title: "Dados dos clientes do assinante", content: <>{p("O assinante decide quais dados de seus clientes serão cadastrados e é responsável por possuir fundamento legal, prestar informações e atender os direitos desses titulares. A plataforma trata esses dados para executar as funcionalidades contratadas, observadas as instruções do assinante e a Política de Privacidade.")}</> },
    { title: "Disponibilidade e integrações", content: <>{p("Buscamos manter o serviço disponível e seguro, mas manutenções, falhas de terceiros ou eventos fora de controle podem causar interrupções. Recursos de e-mail, WhatsApp, pagamentos e hospedagem dependem de provedores externos e de suas regras.")}</> },
    { title: "Propriedade intelectual", content: <>{p(`Software, marca, interface e materiais do ${brand.name} são protegidos. O uso da plataforma não transfere direitos de propriedade intelectual ao usuário.`)}</> },
    { title: "Suspensão e encerramento", content: <>{p("A conta pode ser suspensa por inadimplência, risco de segurança, uso ilícito ou violação destes Termos. Quando juridicamente permitido, o usuário poderá solicitar exportação ou eliminação de seus dados antes do encerramento definitivo.")}</> },
    { title: "Alterações", content: <>{p("Estes Termos podem ser atualizados para refletir mudanças legais, técnicas ou comerciais. Alterações relevantes serão comunicadas e poderão exigir novo aceite.")}</> },
    { title: "Lei aplicável e contato", content: <>{p(`Aplicam-se as leis brasileiras. Dúvidas podem ser enviadas para ${brand.supportEmail}. O foro aplicável observará as regras legais de proteção do consumidor e de competência territorial.`)}</> },
  ]}/>;
}
