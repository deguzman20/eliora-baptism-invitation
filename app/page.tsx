"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";

import {
  CalendarDays,
  Clock,
  MapPin,
  Heart,
  Church,
  Shirt,
  Sparkles,
  Baby,
  Users,
} from "lucide-react";

const EVENT_DATE = "2026-11-22T10:00:00";

// Replace with your actual Google Forms link
const GOOGLE_FORM_URL = "https://forms.google.com/";

// EDIT THESE NAMES
const PARENTS = {
  father: "Alejandro De Guzman",
  mother: "Joyvy De Guzman",
};

// EDIT THESE NAMES
const GODPARENTS = [
  "Sieder Villareal",
  "Ryan Bulot",
  "Maximiano Consul Jr.",
  "Jasmine Chavez",
  "Dwight Yanela",
  "Jesselle Caras",
];

export default function Home() {
  const [opened, setOpened] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const difference = new Date(EVENT_DATE).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff5f7] text-[#704653]">
      {/* ENVELOPE COVER */}
      <AnimatePresence>
        {!opened && (
          <motion.section
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-[#fbe3eb] px-5"
          >
            <div className="absolute inset-0 overflow-hidden">
              <FloatingFlowers />
            </div>

            <Parallax speed={80} className="left-5 top-20 text-5xl opacity-40">
              ✨
            </Parallax>

            <Parallax
              speed={130}
              className="bottom-24 right-5 text-5xl opacity-40"
            >
              🌸
            </Parallax>

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="relative z-10 flex w-full max-w-md flex-col items-center text-center"
            >
              <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[#b9788d]">
                A Special Invitation
              </p>

              {/* ENVELOPE */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative mx-auto aspect-[1.4/1] w-full max-w-sm"
              >
                <div className="absolute inset-0 rounded-xl border border-[#dba2b5] bg-[#f3c2d1] shadow-2xl shadow-pink-300/40" />

                <div
                  className="absolute left-0 top-0 z-10 h-1/2 w-full origin-top"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background: "#e6a9bc",
                  }}
                />

                <div className="absolute inset-x-8 bottom-5 top-7 flex items-center justify-center rounded bg-[#fff9f5] text-center shadow-inner">
                  <div className="flex w-full flex-col items-center justify-center px-4">
                    <p className="mt-16 font-serif text-sm italic text-[#b9788d]">
                      The Baptism of
                    </p>

                    <p className="mt-2 max-w-[220px] font-serif text-xl font-bold leading-tight text-[#b85c7b]">
                      Eliora Faye De Guzman
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-[-20px] left-1/2 z-20 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#f7d9e2] bg-[#c87896] text-white shadow-lg">
                  <Heart size={22} fill="currentColor" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-16 flex flex-col items-center"
              >
                <p className="mb-6 font-serif text-lg italic text-[#b9788d]">
                  You are warmly invited
                </p>

                <button
                  onClick={() => setOpened(true)}
                  className="rounded-full bg-[#b85c7b] px-10 py-4 text-sm font-semibold text-white shadow-xl shadow-pink-300/40 transition hover:scale-105 hover:bg-[#9f4d69]"
                >
                  Open Invitation
                </button>
              </motion.div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* MAIN INVITATION */}
      {opened && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          {/* HERO */}
          <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-20 text-center">
            <FloatingFlowers />

            <Parallax
              speed={180}
              className="left-5 top-28 z-0 text-5xl opacity-40 sm:left-16"
            >
              🌸
            </Parallax>

            <Parallax
              speed={240}
              className="right-5 top-40 z-0 text-4xl opacity-40 sm:right-16"
            >
              ✨
            </Parallax>

            <Parallax
              speed={100}
              className="bottom-20 left-1/4 z-0 text-4xl opacity-40"
            >
              🎀
            </Parallax>

            <Parallax
              speed={150}
              className="bottom-32 right-1/4 z-0 text-3xl opacity-40"
            >
              🦋
            </Parallax>

            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center rounded-[45px] border border-[#f1c4d2] bg-white/80 px-6 py-14 text-center shadow-2xl shadow-pink-200/40 backdrop-blur-md sm:px-16"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#c9899f]">
                You Are Invited
              </p>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="my-7 text-6xl"
              >
                🕊️
              </motion.div>

              <p className="font-serif text-xl italic text-[#b9788d]">
                To the Holy Baptism of
              </p>

              <h1 className="mt-4 font-serif text-5xl font-bold text-[#b85c7b] sm:text-7xl">
                Eliora Faye
              </h1>

              <div className="mx-auto my-8 h-px w-24 bg-[#e9b6c5]" />

              <p className="mx-auto max-w-md text-center leading-relaxed text-[#916b76]">
                With grateful hearts and joyful spirits, we invite you to
                celebrate the Holy Baptism of our precious little angel.
              </p>

              {/* BABY PHOTO */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative mx-auto mt-10 w-full max-w-sm"
              >
                <Parallax
                  speed={40}
                  className="-left-12 top-16 text-4xl opacity-50"
                >
                  🌸
                </Parallax>

                <Parallax
                  speed={70}
                  className="-right-10 bottom-16 text-4xl opacity-50"
                >
                  🎀
                </Parallax>

                <div className="rounded-[35px] border-8 border-white bg-[#fce5ec] p-2 shadow-xl">
                  <img
                    src="/eliora-faye.jpeg"
                    alt="Eliora Faye"
                    className="aspect-[4/5] w-full rounded-[25px] object-cover"
                  />
                </div>
              </motion.div>

              <p className="mt-6 font-serif text-lg italic text-[#b9788d]">
                Our little blessing
              </p>
            </motion.div>
          </section>

          {/* COUNTDOWN */}
          <section className="relative overflow-hidden bg-[#fce5ec] px-5 py-24 text-center">
            <Parallax speed={100} className="left-5 top-10 text-5xl opacity-30">
              🌷
            </Parallax>

            <Parallax
              speed={160}
              className="bottom-10 right-5 text-4xl opacity-30"
            >
              ✨
            </Parallax>

            <Reveal>
              <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
                <p className="text-xs uppercase tracking-[0.3em] text-[#c9899f]">
                  Counting Down To
                </p>

                <h2 className="mt-4 font-serif text-4xl font-bold text-[#b85c7b]">
                  Her Special Day
                </h2>

                <div className="mx-auto mt-10 grid w-full max-w-xl grid-cols-4 gap-2 sm:gap-4">
                  <CountdownBox value={timeLeft.days} label="Days" />
                  <CountdownBox value={timeLeft.hours} label="Hours" />
                  <CountdownBox value={timeLeft.minutes} label="Minutes" />
                  <CountdownBox value={timeLeft.seconds} label="Seconds" />
                </div>
              </div>
            </Reveal>
          </section>

          {/* EVENT DETAILS */}
          <section className="relative overflow-hidden px-5 py-24">
            <Parallax
              speed={130}
              className="right-5 top-20 text-5xl opacity-30"
            >
              🌸
            </Parallax>

            <Reveal>
              <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-[#c9899f]">
                  Details
                </p>

                <h2 className="mt-4 font-serif text-4xl font-bold text-[#b85c7b]">
                  Save The Date
                </h2>

                <div className="mx-auto mt-12 grid w-full max-w-2xl gap-5 sm:grid-cols-2">
                  <InfoCard
                    icon={<CalendarDays />}
                    title="Date"
                    text="Sunday, November 22, 2026"
                  />

                  <InfoCard icon={<Clock />} title="Time" text="10:00 AM" />
                </div>
              </div>
            </Reveal>
          </section>

          {/* PROUD PARENTS */}
          <section className="relative overflow-hidden bg-[#fff0f4] px-5 py-24">
            <Parallax speed={100} className="left-5 top-14 text-5xl opacity-30">
              🎀
            </Parallax>

            <Parallax
              speed={160}
              className="bottom-16 right-5 text-5xl opacity-30"
            >
              🌸
            </Parallax>

            <Reveal>
              <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
                <div className="mb-5 flex items-center justify-center gap-3">
                  <Heart
                    size={22}
                    className="text-[#d48ba2]"
                    fill="currentColor"
                  />

                  <Sparkles size={24} className="text-[#d48ba2]" />

                  <Heart
                    size={22}
                    className="text-[#d48ba2]"
                    fill="currentColor"
                  />
                </div>

                <p className="text-xs uppercase tracking-[0.3em] text-[#c9899f]">
                  With Love From
                </p>

                <h2 className="mt-4 font-serif text-4xl font-bold text-[#b85c7b]">
                  Proud Parents
                </h2>

                <div className="relative mx-auto mt-10 w-full max-w-lg rounded-[40px] border-2 border-[#f3ceda] bg-white px-6 py-10 text-center shadow-xl shadow-pink-100">
                  <div className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-[#d989a3] text-white shadow-md">
                    <Heart size={18} fill="currentColor" />
                  </div>

                  <div className="mb-6 text-4xl">👨‍👩‍👧</div>

                  <p className="font-serif text-2xl font-bold text-[#b85c7b]">
                    {PARENTS.father}
                  </p>

                  <p className="mt-1 text-sm italic text-[#c9899f]">&amp;</p>

                  <p className="font-serif text-2xl font-bold text-[#b85c7b]">
                    {PARENTS.mother}
                  </p>

                  <div className="mx-auto my-6 h-px w-20 bg-[#edc2cf]" />

                  <p className="text-sm leading-relaxed text-[#916b76]">
                    Thank you for being part of our little princess's special
                    day.
                  </p>

                  <div className="mt-6 text-2xl">🌷 💗 🌷</div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* GODPARENTS */}
          <section className="relative overflow-hidden px-5 py-24">
            <Parallax
              speed={130}
              className="right-5 top-16 text-5xl opacity-30"
            >
              🦋
            </Parallax>

            <Parallax
              speed={180}
              className="bottom-16 left-5 text-4xl opacity-30"
            >
              🎀
            </Parallax>

            <Reveal>
              <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                <div className="mb-5 flex items-center justify-center gap-3">
                  <Sparkles size={22} className="text-[#d48ba2]" />

                  <Users size={30} className="text-[#d48ba2]" />

                  <Sparkles size={22} className="text-[#d48ba2]" />
                </div>

                <p className="text-xs uppercase tracking-[0.3em] text-[#c9899f]">
                  Special People
                </p>

                <h2 className="mt-4 font-serif text-4xl font-bold text-[#b85c7b]">
                  Godparents
                </h2>

                <p className="mx-auto mt-5 max-w-md text-center leading-relaxed text-[#916b76]">
                  Thank you for guiding, loving, and supporting our little angel
                  as she grows.
                </p>

                <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
                  {GODPARENTS.map((name, index) => (
                    <motion.div
                      key={`${name}-${index}`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.08,
                      }}
                      whileHover={{
                        y: -6,
                        rotate: index % 2 === 0 ? -1 : 1,
                      }}
                      className="relative flex min-h-[150px] flex-col items-center justify-center rounded-[28px] border border-[#f1c4d2] bg-[#fff0f4] px-5 py-7 text-center shadow-md shadow-pink-100"
                    >
                      <div className="absolute -top-3 text-xl">🎀</div>

                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#d48ba2] shadow-sm">
                        <Heart size={19} fill="currentColor" />
                      </div>

                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9899f]">
                        Godparent
                      </p>

                      <p className="mt-2 font-serif text-lg font-bold text-[#b85c7b]">
                        {name}
                      </p>

                      <div className="mt-3 text-sm text-[#d48ba2]">♡</div>
                    </motion.div>
                  ))}
                </div>

                <p className="mt-8 font-serif text-lg italic text-[#b9788d]">
                  Thank you for being part of Eliora's journey 💗
                </p>
              </div>
            </Reveal>
          </section>

          {/* CHURCH AND VENUE */}
          <section className="relative overflow-hidden bg-[#fff0f4] px-5 py-24">
            <Parallax speed={100} className="left-5 top-16 text-5xl opacity-30">
              🎀
            </Parallax>

            <Parallax
              speed={180}
              className="bottom-16 right-5 text-4xl opacity-30"
            >
              🌷
            </Parallax>

            <Reveal>
              <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-[#c9899f]">
                  Location
                </p>

                <h2 className="mt-4 font-serif text-4xl font-bold text-[#b85c7b]">
                  Join Us
                </h2>

                {/* CHURCH */}
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mx-auto mt-10 w-full max-w-xl rounded-[35px] bg-white p-8 text-center shadow-lg shadow-pink-100"
                >
                  <Church className="mx-auto text-[#d48ba2]" size={36} />

                  <h3 className="mt-5 font-serif text-2xl font-bold text-[#b85c7b]">
                    Church
                  </h3>

                  <p className="mt-3 text-[#916b76]">Your Church Name</p>

                  <p className="text-sm text-[#a7838c]">
                    Saint Francis of Assisi and Santa Quiteria Parish Church
                    (Diocese of Kalookan)
                  </p>

                  <a
                    href="https://www.google.com/maps/place/Saint+Francis+of+Assisi+and+Santa+Quiteria+Parish+Church+(Diocese+of+Kalookan)/@14.6812817,121.0070118,17z/data=!3m1!4b1!4m6!3m5!1s0x3397b6b7c92dc5cb:0xe9526171acaec401!8m2!3d14.6812817!4d121.0095867!16s%2Fg%2F11r9khhhk?entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-block rounded-full bg-[#d989a3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b85c7b]"
                  >
                    View Location
                  </a>
                </motion.div>

                {/* RECEPTION */}
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mx-auto mt-6 w-full max-w-xl rounded-[35px] bg-white p-8 text-center shadow-lg shadow-pink-100"
                >
                  <MapPin className="mx-auto text-[#d48ba2]" size={36} />

                  <h3 className="mt-5 font-serif text-2xl font-bold text-[#b85c7b]">
                    Reception
                  </h3>

                  <p className="mt-3 text-[#916b76]">Your Reception Venue</p>

                  <p className="text-sm text-[#a7838c]">
                    Savory SM North Edsa Annex
                  </p>

                  <a
                    href="https://www.google.com/maps/place/Classic+Savory/@14.6567301,121.0258151,17z/data=!3m1!4b1!4m6!3m5!1s0x3397b6e33fc4aa17:0x10bef2c6a7a15893!8m2!3d14.6567301!4d121.02839!16s%2Fg%2F11h15f228?entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-block rounded-full bg-[#d989a3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b85c7b]"
                  >
                    View Location
                  </a>
                </motion.div>
              </div>
            </Reveal>
          </section>

          {/* DRESS CODE */}
          <section className="relative overflow-hidden px-5 py-24 text-center">
            <Parallax speed={150} className="left-5 top-20 text-4xl opacity-30">
              🌸
            </Parallax>

            <Parallax
              speed={80}
              className="bottom-20 right-5 text-4xl opacity-30"
            >
              🦋
            </Parallax>

            <Reveal>
              <div className="mx-auto flex w-full max-w-xl flex-col items-center">
                <Shirt className="mx-auto text-[#d48ba2]" size={40} />

                <h2 className="mt-5 font-serif text-4xl font-bold text-[#b85c7b]">
                  Dress Code
                </h2>

                <p className="mx-auto mt-5 max-w-md text-center leading-relaxed text-[#916b76]">
                  We invite our guests to celebrate in beautiful pastel pink and
                  white.
                </p>

                <div className="mx-auto mt-8 flex w-full items-center justify-center gap-4">
                  <div className="h-16 w-16 rounded-full border-4 border-white bg-[#f2b6c8] shadow-md" />

                  <div className="h-16 w-16 rounded-full border-4 border-white bg-[#fffaf5] shadow-md" />

                  <div className="h-16 w-16 rounded-full border-4 border-white bg-[#dba2b5] shadow-md" />
                </div>

                <p className="mt-5 text-sm italic text-[#b9788d]">
                  Soft, elegant, and lovely
                </p>
              </div>
            </Reveal>
          </section>

          {/* RSVP */}
          <section
            id="rsvp"
            className="relative overflow-hidden bg-[#fce5ec] px-5 py-28 text-center"
          >
            <Parallax speed={120} className="left-5 top-20 text-5xl opacity-30">
              🎀
            </Parallax>

            <Parallax
              speed={200}
              className="bottom-20 right-5 text-4xl opacity-30"
            >
              ✨
            </Parallax>

            <Reveal>
              <div className="mx-auto flex w-full max-w-xl flex-col items-center">
                <Heart
                  className="mx-auto text-[#d48ba2]"
                  size={38}
                  fill="currentColor"
                />

                <h2 className="mt-5 text-center font-serif text-4xl font-bold text-[#b85c7b]">
                  We Hope You Can Join Us!
                </h2>

                <p className="mx-auto mt-5 max-w-md text-center leading-relaxed text-[#916b76]">
                  Your presence will make this special celebration even more
                  meaningful.
                </p>

                <a
                  href={GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-block rounded-full bg-[#b85c7b] px-8 py-4 font-semibold text-white shadow-lg shadow-pink-200 transition hover:scale-105 hover:bg-[#9f4d69]"
                >
                  Confirm Attendance
                </a>
              </div>
            </Reveal>
          </section>

          {/* FOOTER */}
          <footer className="relative overflow-hidden bg-[#fff5f7] px-5 py-16 text-center">
            <Parallax speed={100} className="left-5 top-10 text-4xl opacity-30">
              🌸
            </Parallax>

            <Parallax
              speed={150}
              className="right-5 top-16 text-4xl opacity-30"
            >
              🌷
            </Parallax>

            <div className="mx-auto flex w-full max-w-xl flex-col items-center">
              <p className="font-serif text-2xl italic text-[#b9788d]">
                With love,
              </p>

              <p className="mt-3 font-serif text-xl font-bold text-[#b85c7b]">
                Eliora Faye & Family
              </p>

              <div className="mt-6 text-2xl">🌸 🕊️ 🌸</div>

              <p className="mt-6 text-xs text-[#bfa0aa]">
                A day filled with love and blessings
              </p>
            </div>
          </footer>
        </motion.div>
      )}
    </main>
  );
}

/* ========================================= */
/* PARALLAX */
/* ========================================= */

function Parallax({
  children,
  speed = 100,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={`pointer-events-none absolute ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ========================================= */
/* REVEAL */
/* ========================================= */

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

/* ========================================= */
/* COUNTDOWN BOX */
/* ========================================= */

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-[#f1c4d2] bg-white p-3 text-center shadow-sm sm:p-5"
    >
      <p className="font-serif text-2xl font-bold text-[#b85c7b] sm:text-4xl">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-2 text-[10px] uppercase tracking-wider text-[#c9899f] sm:text-xs">
        {label}
      </p>
    </motion.div>
  );
}

/* ========================================= */
/* INFO CARD */
/* ========================================= */

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-[#f3d2dc] bg-white p-6 text-center shadow-sm"
    >
      <div className="flex justify-center text-[#d48ba2]">{icon}</div>

      <h3 className="mt-4 font-serif text-xl font-bold text-[#b85c7b]">
        {title}
      </h3>

      <p className="mt-2 text-center text-sm leading-relaxed text-[#916b76]">
        {text}
      </p>
    </motion.div>
  );
}

/* ========================================= */
/* FLOATING FLOWERS */
/* ========================================= */

function FloatingFlowers() {
  return (
    <>
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute left-5 top-16 text-6xl opacity-60"
      >
        🌸
      </motion.div>

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute right-5 top-28 text-6xl opacity-60"
      >
        🌷
      </motion.div>

      <motion.div
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute bottom-20 left-10 text-4xl opacity-60"
      >
        🎀
      </motion.div>
    </>
  );
}
