import { useNavigate } from 'react-router-dom';

export default function TermosPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1A1A1A] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">👨‍👩‍👧‍👦</span>
            <span className="font-display font-bold text-lg tracking-tight">4Family</span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-500 mb-10">
          Ultima atualizacao: 02 de abril de 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* 1 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">1. Aceitacao dos Termos</h2>
            <p className="text-gray-600 leading-relaxed">
              Ao acessar ou utilizar a plataforma 4Family ("Plataforma"), voce concorda em cumprir e estar vinculado a estes Termos de Uso. Caso nao concorde com qualquer disposicao aqui prevista, voce nao devera utilizar a Plataforma. A 4Family e operada por [RAZAO SOCIAL], inscrita no CNPJ sob o numero [CNPJ], com sede em [ENDERECO] ("Empresa").
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">2. Descricao do Servico</h2>
            <p className="text-gray-600 leading-relaxed">
              A 4Family e uma plataforma SaaS de gestao familiar que oferece ferramentas para:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Planejamento e organizacao de refeicoes (FamilyChef)</li>
              <li>Gerenciamento de tarefas domesticas com gamificacao (FamilyHome)</li>
              <li>Controle financeiro compartilhado (FamilyFin)</li>
              <li>Assistente de voz com inteligencia artificial</li>
              <li>Notificacoes push e lembretes</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              A Plataforma esta disponivel como Progressive Web App (PWA) e pode ser acessada via navegadores web em dispositivos moveis e desktop.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">3. Cadastro e Conta</h2>
            <p className="text-gray-600 leading-relaxed">
              3.1. Para utilizar a Plataforma, voce devera criar uma conta fornecendo informacoes verdadeiras, completas e atualizadas.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              3.2. Voce e responsavel por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              3.3. Ao criar uma familia na Plataforma, voce se torna o administrador do grupo familiar e e responsavel por gerenciar os membros adicionados.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              3.4. Menores de 16 anos so podem utilizar a Plataforma com o consentimento e supervisao de seus responsaveis legais, que devem ser os administradores do grupo familiar.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">4. Planos e Pagamentos</h2>
            <p className="text-gray-600 leading-relaxed">
              4.1. A Plataforma oferece planos gratuitos e pagos. As funcionalidades disponiveis em cada plano estao descritas na pagina de precos.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              4.2. Os planos pagos sao cobrados de forma recorrente (mensal ou anual), conforme a opcao escolhida no momento da contratacao.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              4.3. Voce pode cancelar seu plano a qualquer momento. O acesso as funcionalidades pagas sera mantido ate o final do periodo ja pago.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              4.4. A Empresa reserva-se o direito de alterar os precos dos planos, mediante aviso previo de 30 (trinta) dias aos usuarios ativos.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">5. Uso Aceitavel</h2>
            <p className="text-gray-600 leading-relaxed">
              Ao utilizar a Plataforma, voce concorda em:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Nao utilizar a Plataforma para fins ilegais ou nao autorizados</li>
              <li>Nao tentar acessar contas de outros usuarios sem autorizacao</li>
              <li>Nao transmitir virus, malware ou qualquer codigo malicioso</li>
              <li>Nao utilizar robos, scrapers ou meios automatizados para acessar a Plataforma</li>
              <li>Nao reproduzir, duplicar ou revender qualquer parte do servico</li>
              <li>Respeitar os demais membros do grupo familiar na utilizacao da Plataforma</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">6. Propriedade Intelectual</h2>
            <p className="text-gray-600 leading-relaxed">
              6.1. Todos os direitos de propriedade intelectual da Plataforma, incluindo marca, logotipo, design, codigo-fonte, algoritmos e conteudo, pertencem exclusivamente a Empresa.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              6.2. O conteudo gerado pelo usuario (dados familiares, tarefas, registros financeiros, gravacoes de voz) permanece de propriedade do usuario, sendo concedida a Empresa uma licenca limitada para processar e armazenar esses dados exclusivamente para a prestacao do servico.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">7. Assistente de Voz e Gravacoes</h2>
            <p className="text-gray-600 leading-relaxed">
              7.1. A funcionalidade de assistente de voz requer permissao explicita do usuario para acesso ao microfone do dispositivo.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              7.2. As gravacoes de voz sao processadas por servicos de inteligencia artificial de terceiros (OpenAI Whisper) exclusivamente para fins de transcricao e execucao de comandos.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              7.3. As gravacoes de voz nao sao armazenadas permanentemente apos o processamento, sendo descartadas apos a transcricao.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">8. Disponibilidade e Suporte</h2>
            <p className="text-gray-600 leading-relaxed">
              8.1. A Empresa envidara esforcos comercialmente razoaveis para manter a Plataforma disponivel 24 horas por dia, 7 dias por semana, mas nao garante disponibilidade ininterrupta.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              8.2. Manutencoes programadas serao comunicadas com antecedencia razoavel, quando possivel.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              8.3. O suporte tecnico esta disponivel por e-mail em contato@4family.app.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">9. Limitacao de Responsabilidade</h2>
            <p className="text-gray-600 leading-relaxed">
              9.1. A Plataforma e fornecida "como esta" (as is). A Empresa nao garante que a Plataforma atendera a todos os requisitos do usuario ou que operara de forma ininterrupta e livre de erros.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              9.2. A Empresa nao sera responsavel por danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou impossibilidade de uso da Plataforma.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              9.3. A responsabilidade total da Empresa, em qualquer hipotese, estara limitada ao valor pago pelo usuario nos ultimos 12 (doze) meses.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">10. Rescisao</h2>
            <p className="text-gray-600 leading-relaxed">
              10.1. Voce pode encerrar sua conta a qualquer momento, entrando em contato com nosso suporte ou utilizando as configuracoes da Plataforma.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              10.2. A Empresa podera suspender ou encerrar sua conta em caso de violacao destes Termos, mediante notificacao previa quando possivel.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              10.3. Apos o encerramento da conta, seus dados serao tratados conforme nossa Politica de Privacidade, sendo mantidos pelo periodo minimo legal antes da exclusao definitiva.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">11. Alteracoes nos Termos</h2>
            <p className="text-gray-600 leading-relaxed">
              11.1. A Empresa reserva-se o direito de modificar estes Termos a qualquer momento. Alteracoes relevantes serao comunicadas por e-mail ou notificacao na Plataforma com antecedencia minima de 30 (trinta) dias.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              11.2. O uso continuado da Plataforma apos a entrada em vigor das alteracoes constitui aceitacao dos novos Termos.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">12. Legislacao Aplicavel e Foro</h2>
            <p className="text-gray-600 leading-relaxed">
              12.1. Estes Termos sao regidos pelas leis da Republica Federativa do Brasil.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              12.2. Fica eleito o foro da comarca da sede da Empresa para dirimir quaisquer controversias decorrentes destes Termos, com renuncia expressa a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">13. Contato</h2>
            <p className="text-gray-600 leading-relaxed">
              Em caso de duvidas sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <ul className="list-none text-gray-600 mt-2 space-y-1">
              <li><strong>Razao Social:</strong> [RAZAO SOCIAL]</li>
              <li><strong>CNPJ:</strong> [CNPJ]</li>
              <li><strong>Endereco:</strong> [ENDERECO]</li>
              <li><strong>E-mail:</strong> contato@4family.app</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} 4Family. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
