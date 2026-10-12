/** Software simulation definitions: steps, interactive scenarios, layer data. */

export interface SimStep {
  title: string;
  detail: string;
  /** Component id to spotlight in the 3D scene while this step is active (optional). */
  spotlight?: string;
  /** Which scene the spotlight belongs to. */
  scene?: 'desktop' | 'motherboard';
}

export interface Sim {
  id: string;
  title: string;
  subtitle: string;
  steps: SimStep[];
}

export const SIMS: Sim[] = [
  {
    id: 'sim-boot',
    title: 'The boot sequence',
    subtitle: 'What happens between the power button and the login screen',
    steps: [
      {
        title: 'Power on',
        detail:
          'You press the power button. The PSU starts converting mains electricity into the low-voltage DC the components need, and power flows to the motherboard, CPU and drives.',
        spotlight: 'd-psu',
        scene: 'desktop',
      },
      {
        title: 'Firmware wakes up',
        detail:
          'The CPU starts executing the firmware stored in the BIOS/UEFI chip — the very first software to run. It initialises the CPU, memory controller and basic hardware.',
        spotlight: 'm-bios',
        scene: 'motherboard',
      },
      {
        title: 'Power-on self-test (POST)',
        detail:
          'The firmware checks that key hardware is present and working: RAM, keyboard, storage. If something critical is missing, you hear beeps or see an error instead of a boot.',
        spotlight: 'd-ram',
        scene: 'desktop',
      },
      {
        title: 'Bootloader loads',
        detail:
          'Firmware finds the bootloader — a small program at the start of your system drive — and loads it into RAM. The bootloader knows where the operating system lives.',
        spotlight: 'd-ssd',
        scene: 'desktop',
      },
      {
        title: 'Operating system loads',
        detail:
          'The OS kernel and drivers load from the SSD into RAM. This is why a fast SSD makes booting feel instant: the whole OS has to be copied into memory.',
        spotlight: 'd-ssd',
        scene: 'desktop',
      },
      {
        title: 'Login',
        detail:
          'Startup programs launch, the desktop appears, and you log in. From here, every application you open is also copied from storage into RAM before it can run.',
        spotlight: 'd-monitor',
        scene: 'desktop',
      },
    ],
  },
  {
    id: 'sim-ipo',
    title: 'Input → Process → Output',
    subtitle: 'Follow a key press through the whole system',
    steps: [
      {
        title: 'Input: you press a key',
        detail:
          'The keyboard detects the press and sends a scan code — a number identifying the key — to the computer through USB.',
        spotlight: 'd-keyboard',
        scene: 'desktop',
      },
      {
        title: 'Process: the CPU works',
        detail:
          'The operating system hands the key press to the active application. The CPU fetches the instruction, decodes it, and executes it — for example, adding your character to a document in RAM.',
        spotlight: 'd-cpu',
        scene: 'desktop',
      },
      {
        title: 'Memory: RAM holds it',
        detail:
          'Your document lives in RAM while you work, because the CPU can read and write RAM extremely quickly. Nothing is saved to disk yet.',
        spotlight: 'd-ram',
        scene: 'desktop',
      },
      {
        title: 'Output: you see it',
        detail:
          'The GPU renders the updated document as pixels, and the monitor displays it. Input → processing → output: the fundamental cycle of every computer.',
        spotlight: 'd-monitor',
        scene: 'desktop',
      },
    ],
  },
  {
    id: 'sim-ram-storage',
    title: 'RAM vs storage',
    subtitle: 'Why unsaved work disappears when the power goes out',
    steps: [
      {
        title: 'You open a document',
        detail:
          'The file is copied from the SSD (permanent storage) into RAM (working memory). The CPU can only work on data that is in RAM.',
        spotlight: 'd-ssd',
        scene: 'desktop',
      },
      {
        title: 'You type — it lives in RAM',
        detail:
          'Every word you type exists only in RAM. It is blazing fast, but volatile: RAM needs continuous power to remember anything.',
        spotlight: 'd-ram',
        scene: 'desktop',
      },
      {
        title: 'You press Save',
        detail:
          'Saving copies the document from RAM back to the SSD. Now it is non-volatile: it will survive a power cut, a restart, anything.',
        spotlight: 'd-ssd',
        scene: 'desktop',
      },
      {
        title: 'Power cut — what survives?',
        detail:
          'Pull the plug and RAM is instantly wiped: unsaved changes are gone forever. Everything you saved to the SSD is still there when power returns.',
        spotlight: 'd-ram',
        scene: 'desktop',
      },
    ],
  },
  {
    id: 'sim-layers',
    title: 'Software layers',
    subtitle: 'How programs sit on top of each other — and on hardware',
    steps: [
      {
        title: 'Layer 1: Hardware',
        detail:
          'At the bottom: the physical machine. CPU, RAM, storage, and devices. Hardware understands only electrical signals — it needs software to be useful.',
        spotlight: 'd-motherboard',
        scene: 'desktop',
      },
      {
        title: 'Layer 2: Firmware',
        detail:
          'Built into chips on the motherboard. Firmware wakes the hardware at power-on and provides the most basic control before anything else runs.',
        spotlight: 'm-bios',
        scene: 'motherboard',
      },
      {
        title: 'Layer 3: Operating system',
        detail:
          'The OS manages everything: memory, files, processes, and hardware access. Applications never touch hardware directly — they ask the OS.',
        spotlight: 'd-ssd',
        scene: 'desktop',
      },
      {
        title: 'Layer 4: Drivers & utilities',
        detail:
          'Drivers translate between the OS and specific hardware (printers, graphics cards). Utilities — antivirus, backup tools — help manage the system.',
        spotlight: 'd-gpu',
        scene: 'desktop',
      },
      {
        title: 'Layer 5: Applications',
        detail:
          'At the top: the programs you use — browsers, games, word processors. Each one depends on every layer below it. Remove the OS and no application can run.',
        spotlight: 'd-monitor',
        scene: 'desktop',
      },
    ],
  },
  {
    id: 'sim-hwsw',
    title: 'How apps depend on hardware',
    subtitle: 'One photo edit, traced from click to silicon',
    steps: [
      {
        title: 'You click “Apply filter”',
        detail:
          'The mouse sends the click to the operating system, which routes it to the photo-editing application.',
        spotlight: 'd-mouse',
        scene: 'desktop',
      },
      {
        title: 'The app asks the OS',
        detail:
          'The application does not touch hardware itself. It calls operating-system functions: “give me the image data, and prepare the GPU.”',
        spotlight: 'd-ram',
        scene: 'desktop',
      },
      {
        title: 'CPU + GPU do the math',
        detail:
          'The OS schedules the work. The CPU coordinates while the GPU — built for parallel math — recalculates millions of pixels at once.',
        spotlight: 'd-gpu',
        scene: 'desktop',
      },
      {
        title: 'Power keeps it all alive',
        detail:
          'Meanwhile the PSU feeds every chip, the cooler keeps temperatures safe, and the motherboard’s traces carry the data. Software is helpless without hardware.',
        spotlight: 'd-psu',
        scene: 'desktop',
      },
      {
        title: 'Saved to storage',
        detail:
          'You save. The finished image travels from RAM to the SSD, where it persists. Application → OS → hardware → storage: every layer did its job.',
        spotlight: 'd-ssd',
        scene: 'desktop',
      },
    ],
  },
];

export const simById = new Map(SIMS.map((s) => [s.id, s]));
