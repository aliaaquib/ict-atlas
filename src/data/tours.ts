/** Guided tours: ordered sequences of component spotlights with narration. */
import type { AtlasComponent } from './components';

export interface TourStep {
  componentId: string;
  title: string;
  narration: string;
}

export interface Tour {
  id: string;
  scene: 'desktop' | 'motherboard';
  title: string;
  subtitle: string;
  steps: TourStep[];
}

export const TOURS: Tour[] = [
  {
    id: 'tour-inside-pc',
    scene: 'desktop',
    title: 'Inside the PC',
    subtitle: 'Follow the path of data through a desktop computer',
    steps: [
      {
        componentId: 'd-keyboard',
        title: 'It starts with you',
        narration:
          'Everything begins with input. When you press a key, the keyboard sends a signal that travels into the computer. Watch where it goes next.',
      },
      {
        componentId: 'd-cpu',
        title: 'The CPU processes it',
        narration:
          'The processor is the brain. It fetches your key press as an instruction, decodes it, and executes it — billions of times per second.',
      },
      {
        componentId: 'd-ram',
        title: 'RAM holds the working data',
        narration:
          'The CPU keeps the programs and data it is using right now in RAM, because RAM is extremely fast. But remember: RAM forgets everything when the power goes off.',
      },
      {
        componentId: 'd-ssd',
        title: 'Storage keeps it forever',
        narration:
          'Unlike RAM, the SSD keeps data permanently. When you press Save, your work moves from RAM to the SSD — and survives a power cut.',
      },
      {
        componentId: 'd-gpu',
        title: 'The GPU draws the picture',
        narration:
          'To show you anything on screen, the graphics card renders each frame — millions of pixels, 60 or more times per second.',
      },
      {
        componentId: 'd-monitor',
        title: 'Output you can see',
        narration:
          'Finally, the monitor displays the result. Input → processing → storage → output: that is the full journey of your key press.',
      },
    ],
  },
  {
    id: 'tour-motherboard',
    scene: 'motherboard',
    title: 'Motherboard walkthrough',
    subtitle: 'Meet every major socket and connector',
    steps: [
      {
        componentId: 'm-cpu-socket',
        title: 'CPU socket — the throne',
        narration:
          'The most important seat on the board. The processor plugs in here, locked down by the metal lever. Everything else exists to serve it.',
      },
      {
        componentId: 'm-dimm',
        title: 'RAM slots — the fast lane',
        narration:
          'Four long slots beside the CPU. Memory modules click in here, as close to the processor as possible for maximum speed.',
      },
      {
        componentId: 'm-pcie',
        title: 'PCI Express — the expansion highway',
        narration:
          'These long slots take add-in cards. The top x16 slot is where the graphics card lives, with 16 high-speed data lanes.',
      },
      {
        componentId: 'm-m2',
        title: 'M.2 — storage at full speed',
        narration:
          'Modern SSDs slot straight into the board here, talking directly to the CPU over PCIe lanes. No cables needed.',
      },
      {
        componentId: 'm-vrm',
        title: 'VRM — the power kitchen',
        narration:
          'Around the socket, the voltage regulators cook 12 V down to the ~1 V the CPU needs. Clean, stable power is everything.',
      },
      {
        componentId: 'm-bios',
        title: 'Firmware — first to wake',
        narration:
          'This tiny chip holds the firmware: the first software that runs when you press power. It wakes the hardware and loads the operating system.',
      },
      {
        componentId: 'm-rear-io',
        title: 'Rear I/O — the outside world',
        narration:
          'USB, audio, network: everything you plug into the back of the PC connects here, through the chipset.',
      },
    ],
  },
  {
    id: 'tour-cooling-power',
    scene: 'desktop',
    title: 'Power and cooling',
    subtitle: 'How a PC stays fed and frosty',
    steps: [
      {
        componentId: 'd-psu',
        title: 'Power in',
        narration:
          'The PSU converts wall electricity into the low-voltage DC every component needs, and sends it down dedicated cables.',
      },
      {
        componentId: 'd-cables',
        title: 'Power delivery',
        narration:
          'Thick cables carry power to the motherboard, the CPU, and the graphics card. Data cables link the drives.',
      },
      {
        componentId: 'd-cpu-cooler',
        title: 'Hot chip, cool head',
        narration:
          'The CPU can hit 90°C under load. The cooler pulls heat off the chip and the fan pushes it into the case airflow.',
      },
      {
        componentId: 'd-case-fans',
        title: 'Airflow out',
        narration:
          'Case fans complete the loop: cool air in at the front, hot air out at the back. Good airflow is the cheapest performance upgrade there is.',
      },
    ],
  },
];

export const tourById = new Map(TOURS.map((t) => [t.id, t]));
