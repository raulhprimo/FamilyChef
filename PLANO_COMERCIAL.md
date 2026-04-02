# 4Family - Plano de Comercialização

## 🎯 Visão do Produto

**4Family** é uma plataforma SaaS que gamifica a organização familiar — refeições, tarefas domésticas e finanças compartilhadas — transformando responsabilidades do dia-a-dia em um jogo colaborativo com pontos, streaks e rankings.

**Proposta de valor:** "Organize sua casa como um time. Gamifique as tarefas. Una a família."

---

## 📊 Análise de Mercado

### Público-alvo
- **Primário:** Famílias com filhos (8-18 anos) que querem engajar os filhos nas responsabilidades de casa
- **Secundário:** Casais e roommates que dividem tarefas e despesas
- **Terciário:** Famílias estendidas que compartilham responsabilidades

### Concorrentes
| App | Foco | Preço | Fraqueza |
|-----|-------|-------|----------|
| Cozi | Calendário familiar | Grátis + $29.99/ano | Sem gamificação |
| OurHome | Tarefas + recompensas | Grátis + $4.99/mês | Sem finanças, design antigo |
| Splitwise | Divisão de gastos | Grátis + $4.99/mês | Só finanças |
| Todoist | Tarefas genéricas | Grátis + $4/mês | Não é familiar |
| FamilyWall | Organização familiar | Grátis + $4.99/mês | Sem gamificação profunda |

### Diferencial Competitivo
1. **3-em-1:** Refeições + Tarefas + Finanças em um único app
2. **Gamificação profunda:** Pontos, streaks, badges, ranking semanal
3. **Assistente de voz:** 3 agentes IA temáticos (único no mercado)
4. **PWA:** Funciona em qualquer dispositivo sem app store
5. **Real-time:** Atualizações instantâneas entre membros
6. **Design divertido:** Emojis, cores por membro, confetti

---

## 💰 Modelo de Preços

### Plano Gratuito (Free)
- Até **3 membros** na família
- Módulo de **Tarefas** (FamilyHome) completo
- **30 tarefas** por mês
- Ranking e pontuação básica
- Sem assistente de voz
- **Objetivo:** Aquisição e conversão

### Plano Família (R$ 14,90/mês ou R$ 119,90/ano)
- Até **6 membros**
- **Todos os 3 módulos** (Chef + Home + Fin)
- Tarefas ilimitadas
- Ranking completo com badges
- Push notifications + nudges
- Assistente de voz (50 comandos/mês)
- Histórico de 6 meses
- **Objetivo:** Core revenue

### Plano Família+ (R$ 24,90/mês ou R$ 199,90/ano)
- Até **10 membros** (família estendida)
- Tudo do Plano Família +
- Assistente de voz **ilimitado**
- Histórico ilimitado
- Exportação de relatórios (PDF)
- Metas financeiras ilimitadas
- Orçamentos personalizados
- Suporte prioritário
- **Objetivo:** Maximizar LTV

### Modelo Anual
- **20% desconto** no pagamento anual
- Família: R$ 119,90/ano (vs R$ 178,80 mensal)
- Família+: R$ 199,90/ano (vs R$ 298,80 mensal)

---

## 🗺️ Roadmap de Produto

### Fase 1: MVP Comercial (2-3 semanas)
- [ ] **Multi-tenancy:** Cadastro de famílias (auth real com Supabase Auth)
- [ ] **Onboarding:** Fluxo de criação de família + convite de membros
- [ ] **Landing page:** Página de marketing com pricing
- [ ] **Membros dinâmicos:** Remover hardcoding de membros
- [ ] **Stripe/Mercado Pago:** Integração de pagamento
- [ ] **Limites por plano:** Implementar feature gates
- [ ] **Termos de uso e privacidade**

### Fase 2: Crescimento (1-2 meses)
- [ ] **App nativo:** Capacitor.js ou React Native para App Store / Play Store
- [ ] **Notificações melhoradas:** Resumo diário, lembretes inteligentes
- [ ] **Relatórios semanais:** Email com resumo da família
- [ ] **Temas:** Personalização visual por família
- [ ] **Rewards system:** Recompensas reais atreladas a pontos
- [ ] **Compartilhar nas redes:** "Nossa família completou 30 dias de streak!"

### Fase 3: Escala (3-6 meses)
- [ ] **API pública:** Para integrações (Alexa, Google Home)
- [ ] **Marketplace de tarefas:** Templates de rotinas pré-configuradas
- [ ] **IA avançada:** Sugestões automáticas de cardápio baseadas em preferências
- [ ] **Dashboard para pais:** Controle parental e visão gerencial
- [ ] **Programa de referral:** "Convide uma família, ganhe 1 mês grátis"
- [ ] **B2B:** Versão para escolas/creches gerenciarem atividades

---

## 📈 Projeções (Cenário Conservador)

### Métricas-alvo (Primeiro Ano)
| Mês | Usuários Free | Assinantes | MRR |
|-----|---------------|------------|-----|
| 1 | 100 | 5 | R$ 75 |
| 3 | 500 | 40 | R$ 600 |
| 6 | 2.000 | 200 | R$ 3.000 |
| 12 | 8.000 | 800 | R$ 12.000 |

- **Taxa de conversão alvo:** 10% free → pago
- **Churn mensal alvo:** < 5%
- **CAC alvo:** R$ 15 (via marketing orgânico + referral)
- **LTV alvo:** R$ 150 (10 meses de retenção média)

---

## 🚀 Estratégia de Go-to-Market

### Canal 1: Conteúdo Orgânico
- **TikTok/Reels:** Vídeos de "gamificação em família" (alto potencial viral)
- **Blog/SEO:** "Como dividir tarefas de casa", "Apps para organizar a família"
- **YouTube:** Tutoriais e reviews do app

### Canal 2: Comunidades
- **Grupos de mães/pais** no Facebook e WhatsApp
- **Reddit** r/parenting, r/brasil
- **Parcerias** com influenciadores de organização/produtividade

### Canal 3: Product-Led Growth
- **Referral:** Família convida família
- **Freemium:** Plano gratuito generoso para criar hábito
- **Viral loops:** Rankings compartilháveis nas redes sociais

### Canal 4: Parcerias
- **Escolas e creches:** Versão B2B para engajamento familiar
- **Condomínios:** Gestão de tarefas compartilhadas
- **Igrejas/comunidades:** Organização de atividades

---

## 🔧 Mudanças Técnicas Necessárias

### Prioridade Alta
1. **Supabase Auth** - Substituir auth por localStorage por auth real
2. **Multi-tenancy** - Tabela `families` + `family_members` + RLS policies
3. **Membros dinâmicos** - CRUD de membros (remover hardcoding)
4. **Payment gateway** - Stripe ou Mercado Pago
5. **Feature flags** - Sistema de limites por plano

### Prioridade Média
6. **Onboarding flow** - Tela de criação de família + convites por link
7. **Email service** - Verificação, recuperação, relatórios
8. **Analytics** - Mixpanel ou PostHog para métricas
9. **Error tracking** - Sentry para monitoramento
10. **Rate limiting** - Proteger edge functions

### Prioridade Baixa
11. **i18n** - Internacionalização (PT-BR + EN inicialmente)
12. **Temas** - Personalização visual
13. **Export** - Relatórios PDF/CSV
14. **Admin dashboard** - Painel de gestão

---

## 📋 Checklist de Lançamento

### Legal
- [ ] Termos de Uso
- [ ] Política de Privacidade (LGPD compliant)
- [ ] Política de Cookies

### Marketing
- [ ] Landing page com pricing
- [ ] Screenshots/mockups do app
- [ ] Vídeo demo (30s)
- [ ] Redes sociais criadas (Instagram, TikTok)

### Técnico
- [ ] Domínio próprio (ex: 4family.app)
- [ ] SSL configurado
- [ ] Backup automático do banco
- [ ] Monitoramento (uptime + erros)
- [ ] CI/CD pipeline

### Produto
- [ ] Onboarding testado com 3+ famílias beta
- [ ] Feedback incorporado
- [ ] Bugs críticos resolvidos
- [ ] Performance otimizada (Lighthouse 90+)
