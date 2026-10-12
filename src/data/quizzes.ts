/** Quizzes: multiple-choice, ordering, and true/false with explanations. */
import { componentById } from './components.ts';

export type QuizKind = 'choice' | 'order' | 'boolean';

export interface QuizQuestion {
  id: string;
  kind: QuizKind;
  prompt: string;
  /** For 'choice': shuffled at render time. For 'order': the correct order. */
  options: string[];
  /** For 'choice'/'boolean': the correct option text. For 'order': same as options (correct order). */
  answer: string;
  explanation: string;
  /** Optional: highlight this component when the question shows. */
  componentId?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subtitle: string;
  scene?: 'desktop' | 'motherboard';
  questions: QuizQuestion[];
}

export const QUIZZES: Quiz[] = [
  {
    id: 'quiz-identify',
    title: 'Name that component',
    subtitle: 'Identify parts from their descriptions',
    scene: 'desktop',
    questions: [
      {
        id: 'q-cpu',
        kind: 'choice',
        prompt: 'Which component fetches, decodes and executes instructions billions of times per second?',
        options: ['CPU (processor)', 'Hard disk drive', 'Power supply unit', 'Case fan'],
        answer: 'CPU (processor)',
        explanation:
          'The CPU is the brain of the computer — it runs the fetch–decode–execute cycle. Storage and power components support it but do no processing.',
        componentId: 'd-cpu',
      },
      {
        id: 'q-ram',
        kind: 'choice',
        prompt: 'Which memory loses everything stored in it when the power is switched off?',
        options: ['SSD', 'RAM', 'Hard disk drive', 'CMOS battery'],
        answer: 'RAM',
        explanation:
          'RAM is volatile working memory — fast, but temporary. SSDs and hard disks are non-volatile: they keep data without power.',
        componentId: 'd-ram',
      },
      {
        id: 'q-gpu',
        kind: 'choice',
        prompt: 'A student wants smooth 3D graphics for game design. Which part matters most?',
        options: ['Graphics card (GPU)', 'CMOS battery', 'Keyboard', '24-pin ATX cable'],
        answer: 'Graphics card (GPU)',
        explanation:
          'The GPU is built for parallel graphics work — rendering millions of pixels per frame. It slots into a PCI Express x16 slot.',
        componentId: 'd-gpu',
      },
      {
        id: 'q-psu',
        kind: 'choice',
        prompt: 'Which component converts mains electricity into low-voltage DC for the computer?',
        options: ['Motherboard', 'Power supply unit (PSU)', 'CPU cooler', 'BIOS chip'],
        answer: 'Power supply unit (PSU)',
        explanation:
          'The PSU converts AC mains power to the DC voltages components need and delivers them through dedicated cables.',
        componentId: 'd-psu',
      },
      {
        id: 'q-mobo',
        kind: 'choice',
        prompt: 'Which part connects the CPU, RAM, storage and expansion cards so they can communicate?',
        options: ['Monitor', 'Motherboard', 'Mouse', 'SSD'],
        answer: 'Motherboard',
        explanation:
          'The motherboard’s copper traces carry data and power between every component — it is the backbone of the system.',
        componentId: 'd-motherboard',
      },
    ],
  },
  {
    id: 'quiz-motherboard',
    title: 'Motherboard mastery',
    subtitle: 'Sockets, slots and connectors',
    scene: 'motherboard',
    questions: [
      {
        id: 'q-socket',
        kind: 'choice',
        prompt: 'Where does the processor physically sit on the motherboard?',
        options: ['CPU socket', 'M.2 slot', 'SATA connector', 'Fan header'],
        answer: 'CPU socket',
        explanation:
          'The CPU socket holds the processor and connects its hundreds of pins to the board’s power and data traces.',
        componentId: 'm-cpu-socket',
      },
      {
        id: 'q-dimm',
        kind: 'choice',
        prompt: 'RAM modules click into which slots?',
        options: ['PCI Express slots', 'DIMM slots', 'SATA ports', 'Front panel header'],
        answer: 'DIMM slots',
        explanation:
          'DIMM slots hold RAM modules close to the CPU for maximum speed. Installing matched pairs enables faster dual-channel mode.',
        componentId: 'm-dimm',
      },
      {
        id: 'q-pcie',
        kind: 'choice',
        prompt: 'A graphics card normally plugs into which slot?',
        options: ['M.2 slot', 'PCI Express x16 slot', 'DIMM slot', 'CMOS battery holder'],
        answer: 'PCI Express x16 slot',
        explanation:
          'The long x16 PCIe slot gives the graphics card 16 high-speed lanes directly to the CPU.',
        componentId: 'm-pcie',
      },
      {
        id: 'q-firmware',
        kind: 'choice',
        prompt: 'Which chip holds the firmware that runs first when you press the power button?',
        options: ['Chipset', 'BIOS/UEFI firmware chip', 'VRM', 'CMOS battery'],
        answer: 'BIOS/UEFI firmware chip',
        explanation:
          'The firmware chip stores the first software to run: it initialises hardware, runs the power-on self-test, then loads the OS.',
        componentId: 'm-bios',
      },
      {
        id: 'q-vrm',
        kind: 'choice',
        prompt: 'What does the VRM around the CPU socket do?',
        options: [
          'Stores the operating system',
          'Converts 12 V into the stable low voltage the CPU needs',
          'Connects USB devices',
          'Cools the graphics card',
        ],
        answer: 'Converts 12 V into the stable low voltage the CPU needs',
        explanation:
          'The voltage regulator module steps 12 V from the PSU down to roughly 1 V, delivered smoothly in high currents.',
        componentId: 'm-vrm',
      },
    ],
  },
  {
    id: 'quiz-boot-order',
    title: 'Boot sequence',
    subtitle: 'Put the startup steps in the correct order',
    questions: [
      {
        id: 'q-boot',
        kind: 'order',
        prompt: 'Drag the steps into the order they happen when you press the power button.',
        options: [
          'Power reaches the components',
          'Firmware (BIOS/UEFI) initialises hardware',
          'Power-on self-test (POST) checks key hardware',
          'Bootloader loads from the drive',
          'Operating system loads into RAM',
          'Login screen appears',
        ],
        answer: 'Power reaches the components',
        explanation:
          'Power first, then firmware wakes and checks the hardware (POST), then the bootloader hands over to the operating system, which loads into RAM before you can log in.',
      },
    ],
  },
  {
    id: 'quiz-hw-sw',
    title: 'Hardware vs software',
    subtitle: 'Tell physical parts from programs',
    questions: [
      {
        id: 'q-hw1',
        kind: 'boolean',
        prompt: 'A solid-state drive is hardware.',
        options: ['True', 'False'],
        answer: 'True',
        explanation: 'The SSD is a physical device you can hold — that makes it hardware.',
        componentId: 'd-ssd',
      },
      {
        id: 'q-sw1',
        kind: 'boolean',
        prompt: 'An operating system is hardware.',
        options: ['True', 'False'],
        answer: 'False',
        explanation:
          'The OS is software — a set of programs. It is stored on hardware (the SSD) and runs in RAM, but it is not a physical part.',
      },
      {
        id: 'q-hw2',
        kind: 'boolean',
        prompt: 'Firmware is stored on a physical chip, so firmware is hardware.',
        options: ['True', 'False'],
        answer: 'False',
        explanation:
          'Tricky one! Firmware is software — programs — even though it lives on a physical flash chip. Hardware is the chip itself; firmware is the code on it.',
        componentId: 'm-bios',
      },
      {
        id: 'q-sw2',
        kind: 'boolean',
        prompt: 'A device driver is software that lets the operating system talk to hardware.',
        options: ['True', 'False'],
        answer: 'True',
        explanation:
          'Drivers are software translators: the OS uses them to control specific hardware like printers and graphics cards.',
      },
      {
        id: 'q-hw3',
        kind: 'boolean',
        prompt: 'RAM is hardware, but the data stored in it is not.',
        options: ['True', 'False'],
        answer: 'True',
        explanation:
          'The RAM modules are physical hardware. The programs and files held in them are data/software — and they vanish when power is lost.',
        componentId: 'd-ram',
      },
    ],
  },
];

export const quizById = new Map(QUIZZES.map((q) => [q.id, q]));

/** Validate quiz integrity: answers exist in options, order quizzes have >=2 options. */
export function validateQuizzes(): string[] {
  const errors: string[] = [];
  for (const quiz of QUIZZES) {
    if (!quiz.questions.length) errors.push(`${quiz.id}: no questions`);
    for (const q of quiz.questions) {
      if (q.kind === 'order') {
        if (q.options.length < 2) errors.push(`${q.id}: order quiz needs at least 2 steps`);
      } else if (!q.options.includes(q.answer)) {
        errors.push(`${q.id}: answer not among options`);
      }
      if (!q.explanation.trim()) errors.push(`${q.id}: missing explanation`);
      if (q.componentId && !componentById.has(q.componentId)) {
        errors.push(`${q.id}: unknown component ${q.componentId}`);
      }
    }
  }
  return errors;
}
