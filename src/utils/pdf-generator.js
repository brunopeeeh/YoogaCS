import { jsPDF } from "jspdf";

const primaryColor = [0, 45, 98]; // #002D62 (Deep Blue Yooga)
const secondaryColor = [255, 102, 0]; // #FF6600 (Orange Yooga)
const grayText = [100, 116, 139]; // Slate 500
const darkText = [15, 23, 42]; // Slate 900

/**
 * Gera e exporta o PDF Individual de Performance de um colaborador.
 */
export function exportIndividualPDF(user, simulations, scenarios, quizAttempts, certifications) {
  if (!user) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const completedSimulations = simulations.filter(s => s.status === "concluida" && s.evaluation);
  const formattedDate = new Date().toLocaleDateString('pt-BR');
  const formattedTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // 1. Cabeçalho Colorido
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 42, "F");
  
  // Linha decorativa Laranja
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 42, 210, 2, "F");
  
  // Texto do Cabeçalho
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("YOOGA CS COACH", 15, 18);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("PLATAFORMA INTERATIVA DE TREINAMENTO DE CUSTOMER SUCCESS", 15, 25);
  doc.text(`Emissão: ${formattedDate} às ${formattedTime}`, 145, 25);
  
  // 2. Título do Relatório
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("RELATÓRIO INDIVIDUAL DE PERFORMANCE - AGENTE DE CS", 15, 54);
  
  // Informações do Usuário
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayText);
  doc.text("Nome do Colaborador:", 15, 62);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(user.full_name || "Agente Yooga", 50, 62);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayText);
  doc.text("E-mail corporativo:", 15, 67);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(user.email, 50, 67);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayText);
  doc.text("Status de Capacitação:", 15, 72);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129); // Verde
  doc.text(certifications.length > 0 ? `${certifications.length} Módulo(s) Certificado(s) Yooga` : "Em processo de capacitação", 50, 72);

  // 3. Grid de Métricas Consolidadas (Cards)
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setFillColor(248, 250, 252); // Slate 50
  
  // Card 1: Simulações
  doc.rect(15, 80, 42, 20, "FD");
  doc.setTextColor(...grayText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("SIMULAÇÕES", 18, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...darkText);
  doc.text(`${simulations.length}`, 18, 93);
  
  // Card 2: Nota Média Simulações
  doc.rect(62, 80, 42, 20, "FD");
  doc.setTextColor(...grayText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("NOTA MÉDIA SIMUL.", 65, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const avgScoreSim = completedSimulations.length > 0 
    ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.overall_score, 0) / completedSimulations.length)
    : 0;
  doc.setTextColor(16, 185, 129); // verde
  doc.text(`${avgScoreSim}%`, 65, 93);
  
  // Card 3: Quizzes Concluídos
  doc.rect(109, 80, 42, 20, "FD");
  doc.setTextColor(...grayText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("QUIZZES FEITOS", 112, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...darkText);
  doc.text(`${quizAttempts.length}`, 112, 93);
  
  // Card 4: Certificações
  doc.rect(156, 80, 42, 20, "FD");
  doc.setTextColor(...grayText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("CERTIFICAÇÕES", 159, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(245, 158, 11); // Amarelo/Laranja
  doc.text(`${certifications.length}`, 159, 93);

  // 4. Competências de Atendimento (4 Pilares de CS Yooga)
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Média de Desempenho por Competências de CS Yooga", 15, 110);
  
  const empathy = completedSimulations.length > 0 ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.empathy_score, 0) / completedSimulations.length) : 0;
  const resolution = completedSimulations.length > 0 ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.resolution_score, 0) / completedSimulations.length) : 0;
  const professionalism = completedSimulations.length > 0 ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.professionalism_score, 0) / completedSimulations.length) : 0;
  const agility = completedSimulations.length > 0 ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.agility_score, 0) / completedSimulations.length) : 0;
  
  const competencies = [
    { name: "Empatia (Sensibilidade e validação da dor do cliente)", score: empathy },
    { name: "Resolução (Conhecimento Técnico / FAQ Yooga)", score: resolution },
    { name: "Profissionalismo (Tom de voz e humor equilibrado)", score: professionalism },
    { name: "Agilidade (Disponibilidade e tempos)", score: agility }
  ];
  
  let compY = 117;
  competencies.forEach(comp => {
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(comp.name, 15, compY);
    doc.text(`${comp.score}%`, 185, compY);
    
    // Barra de progresso visual
    doc.setFillColor(241, 245, 249); // Fundo da barra
    doc.rect(15, compY + 1.5, 180, 1.5, "F");
    doc.setFillColor(...primaryColor); // Progresso da barra
    doc.rect(15, compY + 1.5, (comp.score / 100) * 180, 1.5, "F");
    
    compY += 8;
  });

  // 5. Histórico Recente de Simulações
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Histórico de Simulações Recentes", 15, 160);
  
  // Tabela simples
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 164, 180, 6, "F");
  doc.text("CENÁRIO / MÓDULO", 18, 168.5);
  doc.text("DATA", 105, 168.5);
  doc.text("DURAÇÃO", 132, 168.5);
  doc.text("SUGESTÕES", 157, 168.5);
  doc.text("NOTA GERAL", 180, 168.5);
  
  doc.setFont("helvetica", "normal");
  let simY = 174;
  const recentSims = completedSimulations.slice(0, 5);
  
  if (recentSims.length === 0) {
    doc.text("Nenhuma simulação de atendimento concluída ainda.", 18, simY);
  } else {
    recentSims.forEach(sim => {
      const scenario = scenarios.find(s => s.id === sim.scenario_id);
      const title = scenario ? scenario.title : "Cenário Personalizado";
      doc.text(title.substring(0, 52), 18, simY);
      doc.text(new Date(sim.created_date).toLocaleDateString('pt-BR'), 105, simY);
      doc.text(`${sim.duration_minutes || 0} min`, 132, simY);
      doc.text(`${sim.suggestions_used || 0}`, 157, simY);
      doc.text(`${sim.evaluation?.overall_score || 0}%`, 180, simY);
      doc.setDrawColor(241, 245, 249);
      doc.line(15, simY + 1.5, 195, simY + 1.5); // Linha divisória
      simY += 6.5;
    });
  }

  // 6. Certificações Ativas
  let certY = 218;
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Certificações de Trilhas de Aprendizado Conquistadas", 15, certY);
  
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(241, 245, 249);
  doc.rect(15, certY + 4, 180, 6, "F");
  doc.text("MÓDULO TÉCNICO DA TRILHA", 18, certY + 8);
  doc.text("DATA CONQUISTA", 105, certY + 8);
  doc.text("AVALIAÇÃO / SCORE", 160, certY + 8);
  
  doc.setFont("helvetica", "normal");
  let activeCertY = certY + 14;
  if (certifications.length === 0) {
    doc.text("Nenhuma trilha concluída com aproveitamento >= 80% ainda.", 18, activeCertY);
  } else {
    certifications.forEach(cert => {
      doc.text(cert.moduleName || "Módulo de Treinamento", 18, activeCertY);
      doc.text(new Date(cert.created_date).toLocaleDateString('pt-BR'), 105, activeCertY);
      doc.text(`${cert.score}% de Aproveitamento`, 160, activeCertY);
      doc.setDrawColor(241, 245, 249);
      doc.line(15, activeCertY + 1.5, 195, activeCertY + 1.5);
      activeCertY += 6.5;
    });
  }

  // Rodapé de Página Única
  doc.setFontSize(7);
  doc.setTextColor(...grayText);
  doc.text("Yooga Tecnologia S/A - Sistema de Simulação de CS. Documento confidencial para fins de treinamento interno.", 15, 287);
  doc.text("Página 1 de 1", 185, 287);

  doc.save(`Relatorio_Performance_CS_${(user.full_name || user.email || 'agente').replace(/\s+/g, '_')}.pdf`);
}

/**
 * Gera e exporta o PDF Consolidado da Equipe (gerencial).
 */
export function exportConsolidatedPDF(simulations, certifications, modules, users, performanceData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const formattedDate = new Date().toLocaleDateString('pt-BR');

  // === PÁGINA 1 ===
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 42, "F");
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 42, 210, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("YOOGA CS COACH", 15, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("RELATÓRIO CONSOLIDADO GERENCIAL - DESEMPENHO DA EQUIPE DE CS", 15, 25);
  doc.text(`Emissão: ${formattedDate}`, 160, 25);

  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("1. Indicadores Globais de Engajamento & Treinamento", 15, 54);

  // Métricas globais
  const completedGlobal = simulations.filter(s => s.status === 'concluida');
  const avgGlobalScore = completedGlobal.length > 0
    ? Math.round(completedGlobal.reduce((acc, sim) => acc + (sim.evaluation?.overall_score || 0), 0) / completedGlobal.length)
    : 0;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  
  // Card 1: Agentes Ativos
  doc.rect(15, 60, 42, 20, "FD");
  doc.setTextColor(...grayText);
  doc.setFontSize(7.5);
  doc.text("AGENTES ATIVOS", 18, 65);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...darkText);
  doc.text(`${users.filter(u => u.role !== 'admin').length}`, 18, 73);

  // Card 2: Simulações Realizadas
  doc.rect(62, 60, 42, 20, "FD");
  doc.setTextColor(...grayText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("SIMULAÇÕES TOTAIS", 65, 65);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...darkText);
  doc.text(`${simulations.length}`, 65, 73);

  // Card 3: Certificados Emitidos
  doc.rect(109, 60, 42, 20, "FD");
  doc.setTextColor(...grayText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("CERTIFICADOS EMITIDOS", 112, 65);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...darkText);
  doc.text(`${certifications.length}`, 112, 73);

  // Card 4: Média Geral
  doc.rect(156, 60, 42, 20, "FD");
  doc.setTextColor(...grayText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("MÉDIA GERAL CS", 159, 65);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // Verde
  doc.text(`${avgGlobalScore}%`, 159, 73);

  // Médias dos pilares
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. Desempenho Agregado por Pilar CS Yooga", 15, 92);

  const empGlobal = completedGlobal.length > 0 ? Math.round(completedGlobal.reduce((acc, sim) => acc + sim.evaluation.empathy_score, 0) / completedGlobal.length) : 0;
  const resGlobal = completedGlobal.length > 0 ? Math.round(completedGlobal.reduce((acc, sim) => acc + sim.evaluation.resolution_score, 0) / completedGlobal.length) : 0;
  const proGlobal = completedGlobal.length > 0 ? Math.round(completedGlobal.reduce((acc, sim) => acc + sim.evaluation.professionalism_score, 0) / completedGlobal.length) : 0;
  const agiGlobal = completedGlobal.length > 0 ? Math.round(completedGlobal.reduce((acc, sim) => acc + sim.evaluation.agility_score, 0) / completedGlobal.length) : 0;

  const competencies = [
    { name: "Empatia (Sensibilidade e validação da dor do cliente)", score: empGlobal },
    { name: "Resolução (Conhecimento Técnico / FAQ Yooga)", score: resGlobal },
    { name: "Profissionalismo (Tom de voz e humor equilibrado)", score: proGlobal },
    { name: "Agilidade (Disponibilidade e tempos de chat)", score: agiGlobal }
  ];

  let compY = 100;
  competencies.forEach(comp => {
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(comp.name, 15, compY);
    doc.text(`${comp.score}%`, 185, compY);
    
    doc.setFillColor(241, 245, 249);
    doc.rect(15, compY + 2, 180, 1.5, "F");
    doc.setFillColor(...primaryColor);
    doc.rect(15, compY + 2, (comp.score / 100) * 180, 1.5, "F");
    compY += 9;
  });

  // Distribuição de Certificações por Módulo
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. Certificações por Trilha de Aprendizado", 15, 148);

  let modY = 156;
  modules.forEach(m => {
    const certCount = certifications.filter(c => c.moduleId === m.id).length;
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(m.name, 15, modY);
    
    doc.setFont("helvetica", "bold");
    doc.text(`${certCount} agente(s) certificado(s)`, 145, modY);
    doc.setDrawColor(241, 245, 249);
    doc.line(15, modY + 2, 195, modY + 2);
    modY += 8;
  });

  doc.setFontSize(7);
  doc.setTextColor(...grayText);
  doc.text("Yooga Tecnologia S/A - Relatório de Atendimento. Página 1 de 2", 15, 287);

  // === PÁGINA 2 ===
  doc.addPage();
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 20, "F");
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 20, 210, 1, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("YOOGA CS COACH - RELATÓRIO CONSOLIDADO GERENCIAL", 15, 12);
  doc.setFontSize(7.5);
  doc.text(`Equipe CS • Emissão: ${formattedDate}`, 155, 12);

  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. Tabela de Classificação & Engajamento da Equipe", 15, 32);

  // Tabela de Agentes
  doc.setFontSize(7.5);
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 37, 180, 6, "F");
  doc.text("AGENTE", 18, 41.5);
  doc.text("SIMULAÇÕES", 90, 41.5);
  doc.text("MÉDIA CS", 120, 41.5);
  doc.text("CERTIFICADOS", 150, 41.5);
  doc.text("ÚLTIMA ATIVIDADE", 172, 41.5);

  doc.setFont("helvetica", "normal");
  let rowY = 47;
  const agents = users.filter(u => u.role !== 'admin');
  
  agents.forEach(ag => {
    const agSims = simulations.filter(s => s.created_by === ag.email && s.status === 'concluida');
    const avg = agSims.length > 0 ? Math.round(agSims.reduce((acc, s) => acc + s.evaluation.overall_score, 0) / agSims.length) : 0;
    const certCount = certifications.filter(c => c.created_by.toLowerCase() === ag.email.toLowerCase()).length;
    
    doc.text(ag.full_name || ag.email, 18, rowY);
    doc.text(`${agSims.length}`, 90, rowY);
    doc.text(`${avg}%`, 120, rowY);
    doc.text(`${certCount}`, 150, rowY);
    
    const lastSim = agSims.length > 0 ? new Date(Math.max(...agSims.map(s => new Date(s.created_date)))).toLocaleDateString('pt-BR') : 'Nunca';
    doc.text(lastSim, 172, rowY);
    
    doc.setDrawColor(241, 245, 249);
    doc.line(15, rowY + 1.5, 195, rowY + 1.5);
    rowY += 6.5;
  });

  // Análise Adaptativa
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("5. Diretrizes de Desenvolvimento Recomendadas pela IA Yooga", 15, 160);

  const allWeakAreas = performanceData.flatMap(p => p.weak_areas || []);
  const weakCounts = allWeakAreas.reduce((acc, area) => {
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});
  const sortedWeak = Object.entries(weakCounts).sort(([,a], [,b]) => b - a).slice(0, 3).map(([a]) => a);
  const weakText = sortedWeak.length > 0 ? sortedWeak.join(", ") : "Empatia, Resolução Técnica";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 166, 180, 35, "F");
  
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.text("Diagnóstico Técnico do Time:", 18, 172);
  doc.setFont("helvetica", "normal");
  doc.text(`As áreas de maior oscilação na equipe atualmente são: ${weakText}.`, 18, 177);
  
  doc.setFont("helvetica", "bold");
  doc.text("Plano de Ação Sugerido:", 18, 184);
  doc.setFont("helvetica", "normal");
  doc.text("1. Direcionar os analistas com notas baixas para reforço técnico em NFC-e e Caixa Offline.", 18, 189);
  doc.text("2. Programar sessões semanais de roleplay baseadas nos 3 cenários práticos ativados no simulador.", 18, 194);

  doc.setFontSize(7);
  doc.setTextColor(...grayText);
  doc.text("Yooga Tecnologia S/A - Relatório de Atendimento. Página 2 de 2", 15, 287);

  doc.save(`Relatorio_Consolidado_Yooga_CS_${formattedDate.replace(/\//g, '_')}.pdf`);
}
