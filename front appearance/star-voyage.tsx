/** Decorative vector scene; no external fonts, images or API calls. */
export default function StarVoyage({language='zh'}:{language?:'zh'|'en'}) {
  return <svg className="voyage-scene" viewBox="0 0 680 520" role="img" aria-label={language==='en'?'A golden sailboat sails toward the moon':'一艘金色帆船在星海中驶向发光的月亮'}>
    <defs>
      <radialGradient id="dream-halo"><stop stopColor="#aab4ef" stopOpacity=".35"/><stop offset="1" stopColor="#829ae5" stopOpacity="0"/></radialGradient>
      <linearGradient id="dream-moon" x2="1" y2="1"><stop stopColor="#fff7d6"/><stop offset="1" stopColor="#dcbf81"/></linearGradient>
      <linearGradient id="dream-sail" x2="1" y2="1"><stop stopColor="#fff4d2"/><stop offset=".55" stopColor="#cfb681"/><stop offset="1" stopColor="#7a797d"/></linearGradient>
      <linearGradient id="dream-hull" x2="0" y2="1"><stop stopColor="#e4c693"/><stop offset="1" stopColor="#705d5c"/></linearGradient>
      <linearGradient id="dream-water"><stop stopColor="#d9c39b" stopOpacity="0"/><stop offset=".5" stopColor="#d9c39b" stopOpacity=".65"/><stop offset="1" stopColor="#d9c39b" stopOpacity="0"/></linearGradient>
      <filter id="dream-glow"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <circle cx="404" cy="193" r="218" fill="url(#dream-halo)"/>
    <g fill="none" stroke="#a5b6eb" strokeWidth=".7">
      <ellipse cx="371" cy="259" rx="262" ry="190" opacity=".19" transform="rotate(-23 371 259)"/>
      <ellipse cx="371" cy="259" rx="225" ry="153" opacity=".11" transform="rotate(-23 371 259)"/>
      <path d="M132 184L192 124 266 155 308 104M490 273L548 229 574 293 620 317" opacity=".35"/>
    </g>
    <g fill="#e2def1">{Array.from({length:48},(_,i)=><circle key={i} className={i%5===0?'twinkle':''} cx={57+(i*113)%562} cy={45+(i*67)%356} r={i%7===0?2:1} opacity={.25+(i%4)*.17} style={{animationDelay:`${i%7}s`}}/>)}</g>
    <g fill="#ffe7b2"><path d="M183 88l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"/><path d="M574 196l2 7 7 2-7 2-2 7-2-7-7-2 7-2Z"/><path d="M306 70l1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5Z"/></g>
    <circle cx="452" cy="139" r="50" fill="#fbe6b6" opacity=".15" filter="url(#dream-glow)"/>
    <path d="M469 92A48 48 0 1 0 488 173A42 42 0 0 1 469 92Z" fill="url(#dream-moon)"/>
    <path d="M507 66L415 116" stroke="#d8d8f3" strokeWidth="1" opacity=".35"/>
    <g className="voyage-boat">
      <path d="M335 191V363" stroke="#e1c58c" strokeWidth="3"/>
      <path d="M327 204Q259 241 239 329Q283 308 327 328Z" fill="url(#dream-sail)"/>
      <path d="M346 223Q393 261 421 333Q383 316 346 328Z" fill="url(#dream-sail)" opacity=".88"/>
      <path d="M327 211Q288 262 263 315M350 237Q380 274 401 319" fill="none" stroke="#fff3cf" opacity=".45"/>
      <path d="M335 185L364 195 335 205" fill="#d2b57c"/>
      <path d="M222 348Q332 374 439 338L409 379Q321 405 252 378Z" fill="url(#dream-hull)"/>
      <path d="M224 348Q329 374 438 338" fill="none" stroke="#f2dbac" strokeWidth="3"/>
      <path d="M257 366Q326 389 406 367" fill="none" stroke="#f9dca3" opacity=".4"/>
      <path d="M336 211L225 348M338 216L434 340" stroke="#d8c59e" strokeWidth=".7" opacity=".55"/>
      <circle cx="301" cy="350" r="7" fill="#ffe6a4" filter="url(#dream-glow)"/>
      <rect x="297" y="341" width="8" height="12" rx="2" fill="#ffe8ab"/>
    </g>
    <g fill="none" stroke="url(#dream-water)" strokeLinecap="round"><path d="M137 395Q302 411 511 389" strokeWidth="2"/><path d="M178 416Q356 435 536 409"/><path d="M90 444Q289 460 446 440"/><path d="M231 466Q339 480 504 450" opacity=".5"/></g>
    <g fill="#ddca9a" opacity=".55"><circle cx="188" cy="400" r="1.6"/><circle cx="457" cy="422" r="1.4"/><circle cx="305" cy="450" r="2"/><circle cx="376" cy="408" r="1.2"/></g>
  </svg>;
}
