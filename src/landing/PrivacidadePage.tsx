import { useNavigate } from 'react-router-dom';

export default function PrivacidadePage() {
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
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Politica de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-10">
          Ultima atualizacao: 02 de abril de 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* Intro */}
          <section>
            <p className="text-gray-600 leading-relaxed">
              A sua privacidade e importante para nos. Esta Politica de Privacidade descreve como a [RAZAO SOCIAL], inscrita no CNPJ sob o numero [CNPJ], com sede em [ENDERECO] ("4Family", "nos" ou "Empresa"), coleta, utiliza, armazena, compartilha e protege seus dados pessoais em conformidade com a Lei Geral de Protecao de Dados Pessoais (Lei n. 13.709/2018 - LGPD) e demais legislacoes aplicaveis.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">1. Controlador de Dados</h2>
            <p className="text-gray-600 leading-relaxed">
              O controlador dos dados pessoais tratados pela Plataforma e:
            </p>
            <ul className="list-none text-gray-600 mt-2 space-y-1">
              <li><strong>Razao Social:</strong> [RAZAO SOCIAL]</li>
              <li><strong>CNPJ:</strong> [CNPJ]</li>
              <li><strong>Endereco:</strong> [ENDERECO]</li>
              <li><strong>E-mail do Encarregado (DPO):</strong> privacidade@4family.app</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">2. Dados Pessoais Coletados</h2>
            <p className="text-gray-600 leading-relaxed">
              Coletamos os seguintes dados pessoais no contexto da utilizacao da Plataforma:
            </p>

            <h3 className="font-display font-semibold text-lg mt-4 mb-2">2.1. Dados de Cadastro</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Nome completo</li>
              <li>Endereco de e-mail</li>
              <li>Foto de perfil (opcional)</li>
              <li>Dados de autenticacao (via provedores como Google ou e-mail/senha)</li>
            </ul>

            <h3 className="font-display font-semibold text-lg mt-4 mb-2">2.2. Dados Familiares</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Nomes dos membros da familia</li>
              <li>Relacao familiar (ex: pai, mae, filho)</li>
              <li>Avatares e apelidos</li>
            </ul>

            <h3 className="font-display font-semibold text-lg mt-4 mb-2">2.3. Dados de Tarefas (FamilyHome)</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Descricao de tarefas domesticas</li>
              <li>Atribuicoes e status de conclusao</li>
              <li>Historico de atividades, pontuacoes e streaks</li>
            </ul>

            <h3 className="font-display font-semibold text-lg mt-4 mb-2">2.4. Dados de Refeicoes (FamilyChef)</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Planejamento de cardapios e refeicoes</li>
              <li>Fotos de refeicoes (opcional)</li>
              <li>Registro de quem preparou cada refeicao</li>
            </ul>

            <h3 className="font-display font-semibold text-lg mt-4 mb-2">2.5. Dados Financeiros (FamilyFin)</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Registro de despesas e categorias</li>
              <li>Dividas e creditos entre membros da familia</li>
              <li>Metas de economia e orcamentos</li>
              <li>Historico de transacoes financeiras familiares</li>
            </ul>

            <h3 className="font-display font-semibold text-lg mt-4 mb-2">2.6. Dados de Voz</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Gravacoes de audio capturadas pelo assistente de voz</li>
              <li>Transcricoes geradas a partir das gravacoes</li>
            </ul>

            <h3 className="font-display font-semibold text-lg mt-4 mb-2">2.7. Dados Tecnicos</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Endereco IP</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Dados de subscricao para push notifications (endpoint, chaves)</li>
              <li>Dados de uso e navegacao na Plataforma</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">3. Finalidades do Tratamento</h2>
            <p className="text-gray-600 leading-relaxed">
              Os dados pessoais sao tratados para as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li><strong>Prestacao do servico:</strong> fornecer as funcionalidades da Plataforma, incluindo gestao de tarefas, refeicoes e financas familiares</li>
              <li><strong>Autenticacao e seguranca:</strong> verificar a identidade do usuario e proteger a conta contra acessos nao autorizados</li>
              <li><strong>Assistente de voz:</strong> processar gravacoes de audio para transcricao e execucao de comandos por voz</li>
              <li><strong>Notificacoes:</strong> enviar push notifications, lembretes e nudges conforme configurado pelo usuario</li>
              <li><strong>Gamificacao:</strong> calcular pontuacoes, streaks, badges e rankings familiares</li>
              <li><strong>Melhoria do servico:</strong> analisar padroes de uso (de forma agregada e anonimizada) para aprimorar a Plataforma</li>
              <li><strong>Comunicacao:</strong> enviar informacoes sobre atualizacoes, novos recursos e suporte tecnico</li>
              <li><strong>Cumprimento legal:</strong> atender obrigacoes legais e regulatorias</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">4. Bases Legais para o Tratamento (LGPD, Art. 7)</h2>
            <p className="text-gray-600 leading-relaxed">
              O tratamento dos seus dados pessoais e fundamentado nas seguintes bases legais:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li><strong>Execucao de contrato (Art. 7, V):</strong> tratamento necessario para a prestacao do servico contratado</li>
              <li><strong>Consentimento (Art. 7, I):</strong> para coleta de gravacoes de voz, push notifications e dados opcionais como fotos</li>
              <li><strong>Legitimo interesse (Art. 7, IX):</strong> para melhoria do servico e comunicacoes sobre a Plataforma</li>
              <li><strong>Cumprimento de obrigacao legal (Art. 7, II):</strong> para atender exigencias legais e regulatorias</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">5. Compartilhamento de Dados</h2>
            <p className="text-gray-600 leading-relaxed">
              Seus dados pessoais podem ser compartilhados com:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
              <li><strong>Membros da familia:</strong> dados como tarefas, refeicoes, pontuacoes e informacoes financeiras sao compartilhados dentro do grupo familiar na Plataforma, conforme a natureza do servico</li>
              <li><strong>Supabase (infraestrutura):</strong> utilizado como provedor de banco de dados, autenticacao e armazenamento. Os dados sao armazenados em servidores seguros</li>
              <li><strong>OpenAI (processamento de voz):</strong> gravacoes de audio sao enviadas ao servico Whisper da OpenAI exclusivamente para transcricao. A OpenAI nao utiliza esses dados para treinamento de modelos</li>
              <li><strong>Provedores de pagamento:</strong> para processamento de pagamentos dos planos pagos. Nao armazenamos dados completos de cartao de credito</li>
              <li><strong>Autoridades competentes:</strong> quando exigido por lei, regulamento ou ordem judicial</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Nao vendemos, alugamos ou comercializamos seus dados pessoais com terceiros para fins de marketing.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">6. Transferencia Internacional de Dados</h2>
            <p className="text-gray-600 leading-relaxed">
              Alguns dos nossos provedores de servico (como Supabase e OpenAI) podem processar dados em servidores localizados fora do Brasil, incluindo nos Estados Unidos. Essas transferencias sao realizadas com base em:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Clausulas contratuais padrao que garantem nivel adequado de protecao de dados</li>
              <li>Provedores que aderem a frameworks de privacidade reconhecidos internacionalmente</li>
              <li>Medidas tecnicas e organizacionais adequadas para protecao dos dados</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">7. Retencao de Dados</h2>
            <p className="text-gray-600 leading-relaxed">
              Seus dados pessoais sao mantidos pelo tempo necessario para cumprir as finalidades para as quais foram coletados:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li><strong>Dados da conta:</strong> mantidos enquanto a conta estiver ativa</li>
              <li><strong>Dados de uso (tarefas, refeicoes, financeiro):</strong> conforme o plano contratado (6 meses no plano Familia, ilimitado no plano Familia+)</li>
              <li><strong>Gravacoes de voz:</strong> descartadas imediatamente apos a transcricao</li>
              <li><strong>Dados de pagamento:</strong> mantidos conforme exigencias fiscais (5 anos)</li>
              <li><strong>Apos exclusao da conta:</strong> dados sao anonimizados ou excluidos em ate 30 (trinta) dias, exceto quando houver obrigacao legal de retencao</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">8. Seguranca dos Dados</h2>
            <p className="text-gray-600 leading-relaxed">
              Adotamos medidas tecnicas e organizacionais para proteger seus dados pessoais, incluindo:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Criptografia de dados em transito (TLS/HTTPS)</li>
              <li>Criptografia de dados em repouso no banco de dados</li>
              <li>Autenticacao segura com tokens JWT</li>
              <li>Row Level Security (RLS) no banco de dados para isolamento de dados entre familias</li>
              <li>Backups regulares e automatizados</li>
              <li>Monitoramento de acessos e atividades suspeitas</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Embora adotemos medidas razoaveis de seguranca, nenhum sistema e completamente seguro. Em caso de incidente de seguranca que possa gerar risco ou dano relevante aos titulares, notificaremos os afetados e a Autoridade Nacional de Protecao de Dados (ANPD) conforme previsto na LGPD.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">9. Seus Direitos como Titular de Dados (LGPD, Art. 18)</h2>
            <p className="text-gray-600 leading-relaxed">
              Nos termos da LGPD, voce tem os seguintes direitos em relacao aos seus dados pessoais:
            </p>
            <div className="bg-white rounded-xl border border-gray-100 p-6 mt-4 space-y-3">
              <div>
                <strong className="text-[#1A1A1A]">a) Confirmacao e acesso:</strong>
                <span className="text-gray-600"> confirmar a existencia de tratamento e acessar seus dados pessoais</span>
              </div>
              <div>
                <strong className="text-[#1A1A1A]">b) Correcao:</strong>
                <span className="text-gray-600"> solicitar a correcao de dados incompletos, inexatos ou desatualizados</span>
              </div>
              <div>
                <strong className="text-[#1A1A1A]">c) Anonimizacao, bloqueio ou eliminacao:</strong>
                <span className="text-gray-600"> solicitar a anonimizacao, bloqueio ou eliminacao de dados desnecessarios ou tratados em desconformidade com a LGPD</span>
              </div>
              <div>
                <strong className="text-[#1A1A1A]">d) Portabilidade:</strong>
                <span className="text-gray-600"> solicitar a portabilidade dos seus dados a outro fornecedor de servico</span>
              </div>
              <div>
                <strong className="text-[#1A1A1A]">e) Eliminacao:</strong>
                <span className="text-gray-600"> solicitar a eliminacao dos dados tratados com base no consentimento</span>
              </div>
              <div>
                <strong className="text-[#1A1A1A]">f) Informacao sobre compartilhamento:</strong>
                <span className="text-gray-600"> obter informacoes sobre as entidades publicas e privadas com as quais compartilhamos seus dados</span>
              </div>
              <div>
                <strong className="text-[#1A1A1A]">g) Revogacao do consentimento:</strong>
                <span className="text-gray-600"> revogar o consentimento a qualquer momento, sem comprometer a licitude do tratamento realizado anteriormente</span>
              </div>
              <div>
                <strong className="text-[#1A1A1A]">h) Oposicao:</strong>
                <span className="text-gray-600"> opor-se ao tratamento realizado com base em hipoteses de dispensa de consentimento, em caso de descumprimento da LGPD</span>
              </div>
              <div>
                <strong className="text-[#1A1A1A]">i) Revisao de decisoes automatizadas:</strong>
                <span className="text-gray-600"> solicitar a revisao de decisoes tomadas unicamente com base em tratamento automatizado de dados pessoais</span>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              Para exercer qualquer desses direitos, entre em contato com nosso Encarregado de Protecao de Dados (DPO) pelo e-mail <strong>privacidade@4family.app</strong>. Responderemos sua solicitacao em ate 15 (quinze) dias uteis.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">10. Cookies e Tecnologias de Rastreamento</h2>
            <p className="text-gray-600 leading-relaxed">
              A Plataforma, sendo um Progressive Web App (PWA), utiliza:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li><strong>Armazenamento local (localStorage):</strong> para manter dados de sessao e preferencias do usuario</li>
              <li><strong>Service Workers:</strong> para funcionamento offline e push notifications</li>
              <li><strong>Tokens de autenticacao:</strong> para manter a sessao do usuario ativa</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Nao utilizamos cookies de rastreamento de terceiros para fins de publicidade.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">11. Dados de Menores</h2>
            <p className="text-gray-600 leading-relaxed">
              11.1. A Plataforma pode ser utilizada por menores de 18 anos dentro do contexto familiar, desde que o cadastro e a supervisao sejam realizados por um responsavel legal.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              11.2. O tratamento de dados pessoais de criancas e adolescentes e realizado no melhor interesse do menor, conforme o Art. 14 da LGPD e o Estatuto da Crianca e do Adolescente (ECA).
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              11.3. O responsavel legal que administra o grupo familiar consente com o tratamento de dados dos menores sob sua responsabilidade ao adiciona-los a Plataforma.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">12. Dados Financeiros</h2>
            <p className="text-gray-600 leading-relaxed">
              12.1. Os dados financeiros registrados no modulo FamilyFin (despesas, dividas, metas) sao informados voluntariamente pelo usuario para fins de organizacao familiar.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              12.2. A 4Family nao e uma instituicao financeira e nao realiza transacoes bancarias. Os dados financeiros na Plataforma sao meramente informativos e organizacionais.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              12.3. Nao acessamos contas bancarias, cartoes de credito ou qualquer sistema financeiro dos usuarios.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">13. Alteracoes nesta Politica</h2>
            <p className="text-gray-600 leading-relaxed">
              13.1. Esta Politica de Privacidade pode ser atualizada periodicamente. Alteracoes significativas serao comunicadas por e-mail ou notificacao na Plataforma com antecedencia minima de 30 (trinta) dias.
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              13.2. Recomendamos que voce revise esta politica periodicamente para se manter informado sobre como protegemos seus dados.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">14. Autoridade Nacional de Protecao de Dados (ANPD)</h2>
            <p className="text-gray-600 leading-relaxed">
              Se voce acredita que o tratamento dos seus dados pessoais viola a LGPD, voce tem o direito de apresentar reclamacao perante a Autoridade Nacional de Protecao de Dados (ANPD):
            </p>
            <ul className="list-none text-gray-600 mt-2 space-y-1">
              <li><strong>Site:</strong> www.gov.br/anpd</li>
              <li><strong>E-mail:</strong> encarregado@anpd.gov.br</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Recomendamos que, antes de recorrer a ANPD, entre em contato conosco para que possamos resolver sua questao diretamente.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="font-display text-xl font-bold mb-3">15. Contato</h2>
            <p className="text-gray-600 leading-relaxed">
              Para duvidas, solicitacoes ou reclamacoes sobre esta Politica de Privacidade ou sobre o tratamento de seus dados pessoais:
            </p>
            <ul className="list-none text-gray-600 mt-2 space-y-1">
              <li><strong>Razao Social:</strong> [RAZAO SOCIAL]</li>
              <li><strong>CNPJ:</strong> [CNPJ]</li>
              <li><strong>Endereco:</strong> [ENDERECO]</li>
              <li><strong>E-mail geral:</strong> contato@4family.app</li>
              <li><strong>E-mail do DPO:</strong> privacidade@4family.app</li>
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
