"use client";

import { FormEvent, useState } from "react";
import {
  AudioLines,
  BrainCircuit,
  CalendarClock,
  ChartNoAxesCombined,
  UsersRound,
  WalletCards,
} from "lucide-react";

const features = [
  { number: "01", icon: WalletCards, title: "Единая картина", text: "Счета, карты, расходы и цели — в одном понятном пространстве." },
  { number: "02", icon: AudioLines, title: "Голосовое управление", text: "Спросите о деньгах так же просто, как спросили бы личного финансиста." },
  { number: "03", icon: ChartNoAxesCombined, title: "Умные рекомендации", text: "WALLY замечает закономерности и предлагает следующий разумный шаг." },
  { number: "04", icon: UsersRound, title: "Семейный бюджет", text: "Общие цели, личные лимиты и прозрачность без лишнего контроля." },
  { number: "05", icon: CalendarClock, title: "Платежи и долги", text: "Напоминания, календарь обязательств и ранние предупреждения о рисках." },
  { number: "06", icon: BrainCircuit, title: "Финансовые привычки", text: "Советы адаптируются к вашему поведению, стилю жизни и приоритетам." },
];

const steps = [
  ["01", "Подключите данные", "Банковские интеграции или безопасный импорт операций."],
  ["02", "Поговорите с WALLY", "Голосом или в чате: «Сколько мы можем отложить в этом месяце?»"],
  ["03", "Получите план действий", "Не просто цифры, а ясный ответ, предупреждение или рекомендация."],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  }

  return (
    <main>
      <section className="hero" id="top">
        <nav className="nav shell" aria-label="Основная навигация">
          <a className="brand" href="#top" aria-label="WALLY — на главную">
            <img className="brand-logo-full" src="/wally-logo-transparent-hd.png" alt="WALLY — ваш финансовый интеллект" />
          </a>
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Открыть меню"
          >
            <span /><span />
          </button>
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#capabilities" onClick={() => setMenuOpen(false)}>Возможности</a>
            <a href="#analytics" onClick={() => setMenuOpen(false)}>Аналитика</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>Как работает</a>
            <a href="#family" onClick={() => setMenuOpen(false)}>Для семьи</a>
            <a href="#security" onClick={() => setMenuOpen(false)}>Безопасность</a>
            <a className="nav-cta" href="#waitlist" onClick={() => setMenuOpen(false)}>Ранний доступ</a>
          </div>
        </nav>

        <div className="hero-grid shell">
          <div className="hero-copy">
            <p className="eyebrow">Персональный финансовый AI-ассистент</p>
            <h1>Финансы, которые <span>понимают вас</span></h1>
            <p className="hero-text">
              WALLY слушает, анализирует и помогает управлять личными и семейными
              финансами — голосом, каждый день.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#waitlist"><i className="wave-icon" />Получить ранний доступ</a>
              <a className="button secondary" href="#partners">Для партнёров</a>
            </div>
            <p className="trust-line"><span>✓</span> Ваши данные защищены и принадлежат только вам</p>
          </div>
          <div className="hero-visual" aria-label="Визуализация финансового интеллекта WALLY">
            <img src="/wally-hero-orb.png" alt="" />
            <div className="wally-bot hero-bot" aria-hidden="true">
              <div className="bot-antenna"><i /></div>
              <div className="bot-head">
                <div className="bot-face"><i /><i /></div>
                <span className="bot-smile" />
              </div>
              <div className="bot-neck" />
              <div className="bot-body"><b>W</b><span /></div>
              <div className="bot-arm bot-arm-left"><i /></div>
              <div className="bot-arm bot-arm-right"><i /></div>
              <div className="bot-shadow" />
            </div>
            <div className="bot-message"><span>WALLY советует</span><b>Начнём с семейной цели?</b></div>
            <div className="insight insight-one"><b>−24%</b><span>расходы за месяц</span></div>
            <div className="insight insight-two"><b>68%</b><span>семейная цель</span></div>
            <div className="insight insight-three"><b>+12%</b><span>к накоплениям</span></div>
          </div>
        </div>
        <a className="scroll-cue" href="#capabilities" aria-label="Прокрутить к возможностям">↓</a>
      </section>

      <section className="section shell" id="capabilities">
        <div className="section-head">
          <div>
            <p className="eyebrow">Не просто учёт расходов</p>
            <h2>Финансовый интеллект,<br />который действует вместе с вами</h2>
          </div>
          <p>WALLY превращает ежедневные операции в ясную картину и помогает не откладывать важные финансовые решения.</p>
        </div>
        <div className="feature-grid">
          {features.map(({ number, icon: Icon, title, text }) => (
            <article className="feature-card" key={number}>
              <div className="feature-card-top">
                <span>{number}</span>
                <div className="feature-icon" aria-hidden="true"><Icon /></div>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="intelligence" id="analytics">
        <div className="shell">
          <div className="intelligence-head">
            <div>
              <p className="eyebrow">Живой финансовый интеллект</p>
              <h2>WALLY видит картину.<br />Объясняет причины. Предлагает действие.</h2>
            </div>
            <p>Демонстрация интерфейса: показатели ниже показывают, как WALLY может превращать операции семьи в понятные выводы и прогнозы.</p>
          </div>

          <div className="ai-dashboard">
            <article className="dash-card spending-card">
              <div className="dash-title"><span>Расходы по категориям</span><small>Этот месяц</small></div>
              <div className="donut" aria-label="Демонстрационная структура расходов"><b>8,4</b><span>млн сум</span></div>
              <div className="legend">
                <p><i className="cyan" />Дом и продукты <b>42%</b></p>
                <p><i className="mint" />Транспорт <b>18%</b></p>
                <p><i className="coral" />Другое <b>40%</b></p>
              </div>
              <div className="mini-robot robot-cash" aria-hidden="true">
                <i className="mini-antenna" /><div className="mini-head"><i /><i /></div><div className="mini-body">W</div><span className="pointer-arm" />
              </div>
            </article>

            <article className="dash-card forecast-card">
              <div className="dash-title"><span>Прогноз накоплений</span><small>12 месяцев</small></div>
              <div className="forecast-value"><b>18 млн</b><span>цель достижима</span></div>
              <svg className="trend-chart" viewBox="0 0 520 190" role="img" aria-label="Демонстрационный график роста накоплений">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#48dded" stopOpacity=".38" /><stop offset="1" stopColor="#48dded" stopOpacity="0" /></linearGradient>
                  <clipPath id="progress-reveal">
                    <rect x="20" y="0" width="0" height="190">
                      <animate attributeName="width" values="0;480;480;0" keyTimes="0;0.72;0.9;1" dur="6.5s" repeatCount="indefinite" />
                    </rect>
                  </clipPath>
                </defs>
                <path className="chart-grid" d="M20 30H500M20 80H500M20 130H500M20 180H500" />
                <g clipPath="url(#progress-reveal)">
                  <path className="chart-area" d="M20 170 C75 165 90 146 135 145 S205 123 250 118 S325 91 365 82 S440 42 500 30 L500 180 L20 180Z" />
                  <path className="chart-line" d="M20 170 C75 165 90 146 135 145 S205 123 250 118 S325 91 365 82 S440 42 500 30" />
                </g>
                <circle className="chart-target" cx="500" cy="30" r="7" />
                <circle className="chart-runner" r="6">
                  <animateMotion
                    path="M20 170 C75 165 90 146 135 145 S205 123 250 118 S325 91 365 82 S440 42 500 30"
                    keyPoints="0;1;1;0"
                    keyTimes="0;0.72;0.9;1"
                    calcMode="linear"
                    dur="6.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
              <div className="chart-months"><span>Авг</span><span>Ноя</span><span>Фев</span><span>Май</span><span>Июл</span></div>
            </article>

            <article className="dash-card pulse-card">
              <div className="dash-title"><span>Финансовый пульс</span><small>AI-оценка</small></div>
              <div className="score"><b>82</b><span>/ 100</span></div>
              <div className="score-track"><i /></div>
              <p>Бюджет устойчив. Резерв растёт быстрее, чем в прошлом месяце.</p>
              <div className="mini-robot robot-score" aria-hidden="true">
                <i className="mini-antenna" /><div className="mini-head"><i /><i /></div><div className="mini-body">W</div>
              </div>
            </article>

            <article className="dash-card ai-feed">
              <div className="dash-title"><span>Что заметил WALLY</span><small><i className="live-dot" />Сейчас</small></div>
              <div className="feed-item"><b>01</b><p><strong>Можно сэкономить 320 000 сум</strong><span>Подписки и повторяющиеся платежи</span></p></div>
              <div className="feed-item"><b>02</b><p><strong>Цель идёт по плану</strong><span>В этом месяце отложено 1,5 млн сум</span></p></div>
              <div className="feed-item"><b>03</b><p><strong>Платёж через 3 дня</strong><span>WALLY заранее напомнит семье</span></p></div>
              <div className="mini-robot robot-feed" aria-hidden="true">
                <i className="mini-antenna" /><div className="mini-head"><i /><i /></div><div className="mini-body">W</div><span className="pointer-arm" />
              </div>
            </article>
          </div>
          <p className="demo-note">* Все показатели в блоке приведены для демонстрации возможностей продукта.</p>
        </div>
      </section>

      <section className="voice-section" id="how">
        <div className="shell voice-grid">
          <div className="voice-demo">
            <div className="voice-orb"><span /><span /><span /><span /><span /></div>
            <p>«WALLY, сможем ли мы накопить 18 млн сум на семейный отпуск за год?»</p>
            <div className="answer">
              <small>Пример расчёта WALLY</small>
              <strong>Да — если откладывать по 1,5 млн сум ежемесячно в течение 12 месяцев.</strong>
              <span>Я создал цель на 18 млн сум и буду следить за её выполнением.</span>
            </div>
          </div>
          <div>
            <p className="eyebrow">Разговор вместо таблиц</p>
            <h2>Просто спросите.<br />WALLY разберётся в цифрах.</h2>
            <p className="section-copy">Не нужно искать нужный отчёт или вручную сводить расходы. WALLY понимает финансовый контекст и отвечает человеческим языком.</p>
            <div className="mini-list">
              <p><span>01</span> Понимает голосовые команды</p>
              <p><span>02</span> Учитывает привычки и цели</p>
              <p><span>03</span> Объясняет каждую рекомендацию</p>
            </div>
          </div>
        </div>
      </section>

      <section className="family-section" id="family">
        <img className="family-visual" src="https://getwally.uz/wally-steps-robot.png" alt="" aria-hidden="true" />
        <div className="section shell family-content">
          <div className="section-head compact">
            <div><p className="eyebrow">Как это работает</p><h2>От данных — к решению<br />за три понятных шага</h2></div>
          </div>
          <div className="steps">
            {steps.map(([number, title, text]) => (
              <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="security" id="security">
        <div className="shell security-grid">
          <div className="shield">W</div>
          <div>
            <p className="eyebrow">Безопасность по умолчанию</p>
            <h2>Ваши финансы<br />под вашей защитой</h2>
            <p>WALLY проектируется по принципу минимального доступа: прозрачные разрешения, шифрование и полный контроль пользователя над подключёнными данными.</p>
            <div className="security-points">
              <span>Шифрование данных</span><span>Контроль доступа</span><span>Прозрачные разрешения</span>
            </div>
          </div>
        </div>
      </section>

      <section className="roadmap-section" id="partners">
        <img className="roadmap-visual" src="https://getwally.uz/wally-roadmap-wave.png" alt="" aria-hidden="true" />
        <div className="roadmap shell">
          <div>
            <p className="eyebrow">Продукт Узбекистана</p>
            <h2>WALLY растёт вместе<br />с пользователем</h2>
            <p>Первый релиз объединит Telegram-бот и web-приложение. Затем — банковские интеграции, расширенная семейная аналитика и масштабирование.</p>
          </div>
          <div className="roadmap-list">
            <article><span>Сейчас</span><b>MVP и раннее тестирование</b><p>Голос, категоризация, бюджет и цели</p></article>
            <article><span>Далее</span><b>Интеграции и персонализация</b><p>Банки, финансовые сценарии и семейный режим</p></article>
            <article><span>Масштаб</span><b>Международное развитие</b><p>Локализация продукта и развитие партнёрской сети</p></article>
          </div>
        </div>
      </section>

      <section className="waitlist" id="waitlist">
        <div className="shell waitlist-grid">
          <div>
            <p className="eyebrow">Будьте среди первых</p>
            <h2>Познакомьтесь с WALLY раньше остальных</h2>
            <p>Оставьте контакты — мы пригласим вас на раннее тестирование или обсудим партнёрство.</p>
          </div>
          <form onSubmit={submitForm}>
            <label>Имя<input name="name" required placeholder="Как к вам обращаться?" /></label>
            <label>Телефон или Telegram<input name="contact" required placeholder="+998 или @username" /></label>
            <label>Я хочу
              <select name="type" defaultValue="early">
                <option value="early">Получить ранний доступ</option>
                <option value="partner">Стать партнёром</option>
                <option value="investor">Обсудить инвестиции</option>
              </select>
            </label>
            <button className="button primary" type="submit">Отправить заявку</button>
            {sent && <p className="success" role="status">Спасибо! Заявка принята.</p>}
          </form>
        </div>
      </section>

      <footer className="footer shell">
        <a className="brand" href="#top"><span className="brand-mark">W</span><span>WALLY</span></a>
        <p>Wallet &amp; AI-based Listening Logic for You</p>
        <p>© 2026 WALLY. Ваш финансовый интеллект.</p>
      </footer>
    </main>
  );
}
