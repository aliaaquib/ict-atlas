/**
 * ICT Atlas — component content model.
 *
 * Every selectable 3D part has one record here. Scene code maps part IDs to
 * meshes; this file owns all educational content. Content is verified by
 * scripts/validate-content.mjs (ids, relationships, quiz answers, search).
 */

export type ComponentCategory =
  | 'chassis'
  | 'processing'
  | 'memory'
  | 'storage'
  | 'graphics'
  | 'power'
  | 'cooling'
  | 'connectivity'
  | 'peripheral'
  | 'motherboard'
  | 'firmware';

export interface AtlasComponent {
  /** Stable id, also the 3D part id (prefixed by mode where shared). */
  id: string;
  /** Which scene owns this part. */
  scene: 'desktop' | 'motherboard';
  name: string;
  aliases: string[];
  category: ComponentCategory;
  /** One-paragraph student-friendly description. */
  description: string;
  /** What it does, in one or two sentences. */
  function: string;
  /** Real-world examples students may have heard of. */
  examples: string[];
  /** IDs of related components (navigation graph). */
  related: string[];
  /** Cambridge IGCSE ICT 0417 topic areas this maps to. Not an official endorsement. */
  syllabus: string[];
  /** Selectable in the 3D scene (false = decorative context). */
  selectable: boolean;
  /** Human-verified content. */
  verified: boolean;
}

export const CATEGORY_LABEL: Record<ComponentCategory, string> = {
  chassis: 'Chassis & structure',
  processing: 'Processing',
  memory: 'Memory',
  storage: 'Storage',
  graphics: 'Graphics',
  power: 'Power',
  cooling: 'Cooling',
  connectivity: 'Connectivity',
  peripheral: 'Peripherals',
  motherboard: 'Motherboard',
  firmware: 'Firmware',
};

export const COMPONENTS: AtlasComponent[] = [
  // ---------------------------------------------------------------- desktop
  {
    id: 'd-case',
    scene: 'desktop',
    name: 'PC case (chassis)',
    aliases: ['tower', 'chassis', 'computer case'],
    category: 'chassis',
    description:
      'The metal and plastic enclosure that holds every internal component of a desktop computer. It protects parts from dust and damage, controls airflow for cooling, and provides mounting points for the motherboard, drives and power supply.',
    function:
      'Houses and protects internal components; its panels and vents shape the airflow that keeps the system cool.',
    examples: ['ATX mid-tower', 'Mini-ITX case'],
    related: ['d-side-panel', 'd-motherboard', 'd-psu', 'd-case-fans'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-side-panel',
    scene: 'desktop',
    name: 'Side panel',
    aliases: ['case panel', 'side cover'],
    category: 'chassis',
    description:
      'The removable cover on the side of the PC case. Technicians remove it to install or replace parts. Try hiding it in the scene to look inside.',
    function:
      'Gives access to the internals for upgrades and repairs; keeps dust out during normal use.',
    examples: ['Tempered glass panel', 'Steel panel'],
    related: ['d-case', 'd-motherboard'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-motherboard',
    scene: 'desktop',
    name: 'Motherboard',
    aliases: ['mainboard', 'mobo', 'system board'],
    category: 'motherboard',
    description:
      'The large circuit board everything plugs into. Copper traces on the board carry data and power between the CPU, RAM, storage, expansion cards and peripherals. Open the Motherboard Lab for a close-up of every socket and connector.',
    function:
      'Connects all components so they can communicate; distributes power from the PSU to every part.',
    examples: ['ATX motherboard', 'Micro-ATX motherboard'],
    related: ['d-cpu', 'd-ram', 'd-gpu', 'd-psu', 'm-cpu-socket', 'm-dimm'],
    syllabus: ['1.1 Computer systems', '1.3 Hardware'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-cpu',
    scene: 'desktop',
    name: 'CPU (processor)',
    aliases: ['processor', 'central processing unit', 'chip'],
    category: 'processing',
    description:
      'The central processing unit is the brain of the computer. It fetches instructions from memory, decodes them, and executes them — billions of times per second. It sits in the CPU socket under the cooler.',
    function:
      'Executes program instructions using the fetch–decode–execute cycle; performs arithmetic, logic and control operations.',
    examples: ['Intel Core i5', 'AMD Ryzen 5', 'Apple M-series'],
    related: ['d-cpu-cooler', 'd-ram', 'd-motherboard', 'm-cpu-socket', 'm-vrm'],
    syllabus: ['1.1 Computer systems', '1.2 Logic gates and circuits'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-cpu-cooler',
    scene: 'desktop',
    name: 'CPU cooler',
    aliases: ['heatsink', 'fan cooler', 'cooling fan'],
    category: 'cooling',
    description:
      'The CPU gets very hot under load. The cooler — a metal heatsink with a fan, or sometimes a liquid-cooling block — draws heat away from the chip and blows it out of the case. Without it, the CPU would overheat and shut down.',
    function:
      'Transfers heat away from the CPU and dissipates it so the processor can run at full speed safely.',
    examples: ['Tower air cooler', 'AIO liquid cooler'],
    related: ['d-cpu', 'd-case-fans', 'd-psu'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-ram',
    scene: 'desktop',
    name: 'RAM (memory modules)',
    aliases: ['memory', 'DIMM', 'random access memory', 'main memory'],
    category: 'memory',
    description:
      'Random access memory is the computer’s working desk. It holds the programs and data the CPU is using right now, and it is extremely fast. But it is volatile: everything in RAM disappears when the power is switched off — which is why you save your work.',
    function:
      'Stores data and instructions currently in use so the CPU can reach them quickly; contents are lost when power is off.',
    examples: ['DDR5 DIMM', '16 GB memory kit'],
    related: ['d-cpu', 'd-ssd', 'd-hdd', 'm-dimm'],
    syllabus: ['1.1 Computer systems', '1.3 Hardware'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-gpu',
    scene: 'desktop',
    name: 'Graphics card (GPU)',
    aliases: ['video card', 'discrete GPU', 'graphics processing unit'],
    category: 'graphics',
    description:
      'A dedicated processor for graphics. It plugs into a PCI Express slot and has its own fast memory (VRAM). Games, 3D design and AI workloads run far faster on a GPU because it can do thousands of calculations in parallel.',
    function:
      'Renders images, video and 3D graphics; accelerates parallel workloads such as AI and video editing.',
    examples: ['NVIDIA GeForce RTX', 'AMD Radeon RX'],
    related: ['d-motherboard', 'd-psu', 'd-monitor', 'm-pcie'],
    syllabus: ['1.1 Computer systems', '1.3 Hardware'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-psu',
    scene: 'desktop',
    name: 'Power supply unit (PSU)',
    aliases: ['power supply', 'psu'],
    category: 'power',
    description:
      'Converts mains electricity (AC) into the low-voltage DC power the components need, and delivers it through dedicated cables: 24-pin for the motherboard, 8-pin for the CPU, and PCIe cables for the graphics card.',
    function:
      'Supplies stable, correctly-rated power to every component; protects against electrical faults.',
    examples: ['550 W 80+ Bronze PSU', 'Modular PSU'],
    related: ['d-motherboard', 'd-cpu', 'd-gpu', 'm-atx-power', 'm-cpu-power'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-ssd',
    scene: 'desktop',
    name: 'SSD (solid-state drive)',
    aliases: ['solid state drive', 'NVMe', 'M.2 SSD'],
    category: 'storage',
    description:
      'A storage device with no moving parts — data lives in flash memory chips. It is far faster than a hard disk, silent, and shock-resistant. The operating system and programs usually live here so the computer boots in seconds.',
    function:
      'Provides fast, permanent (non-volatile) storage for the operating system, applications and files.',
    examples: ['NVMe M.2 SSD', 'SATA SSD'],
    related: ['d-ram', 'd-hdd', 'm-m2', 'm-sata'],
    syllabus: ['1.3 Hardware', '3.2 Storage'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-hdd',
    scene: 'desktop',
    name: 'Hard disk drive (HDD)',
    aliases: ['hard drive', 'hard disk', 'spinning disk'],
    category: 'storage',
    description:
      'Stores data on spinning magnetic platters read by a moving arm. Slower than an SSD and sensitive to knocks, but still the cheapest way to store very large amounts of data, such as backups and media libraries.',
    function:
      'Provides large-capacity, permanent storage using magnetic recording; data survives power loss.',
    examples: ['2 TB desktop HDD', 'External backup drive'],
    related: ['d-ssd', 'd-ram', 'm-sata'],
    syllabus: ['1.3 Hardware', '3.2 Storage'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-case-fans',
    scene: 'desktop',
    name: 'Case fans',
    aliases: ['cooling fans', 'chassis fans'],
    category: 'cooling',
    description:
      'Fans mounted in the case create airflow: cool air enters at the front or bottom, hot air leaves at the rear or top. Good airflow keeps the CPU, GPU and other parts within safe temperatures.',
    function:
      'Move air through the case to carry heat away from hot components.',
    examples: ['120 mm case fan', 'RGB intake fan'],
    related: ['d-cpu-cooler', 'd-case', 'm-fan-headers'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-cables',
    scene: 'desktop',
    name: 'Power and data cables',
    aliases: ['wiring', 'cables', 'PSU cables'],
    category: 'connectivity',
    description:
      'Cables carry power from the PSU (24-pin motherboard, 8-pin CPU, PCIe power) and data between drives and the motherboard (SATA cables). Neat cabling improves airflow and makes upgrades easier.',
    function:
      'Deliver power and data connections between the PSU, motherboard, drives and graphics card.',
    examples: ['24-pin ATX cable', 'SATA data cable', '8-pin EPS cable'],
    related: ['d-psu', 'd-ssd', 'd-hdd', 'd-gpu'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-monitor',
    scene: 'desktop',
    name: 'Monitor',
    aliases: ['display', 'screen'],
    category: 'peripheral',
    description:
      'An output device that shows the computer’s visual output. It connects to the graphics card (or motherboard video output) with HDMI or DisplayPort. Resolution and refresh rate determine how sharp and smooth the image looks.',
    function:
      'Displays text, images and video produced by the computer — the main visual output device.',
    examples: ['24" 1080p monitor', 'HDMI display'],
    related: ['d-gpu', 'd-keyboard', 'd-mouse'],
    syllabus: ['1.3 Hardware', '2.1 Input and output devices'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-keyboard',
    scene: 'desktop',
    name: 'Keyboard',
    aliases: ['input device'],
    category: 'peripheral',
    description:
      'The main text input device. Each key press sends a scan code to the computer, where the operating system and applications turn it into characters and commands.',
    function:
      'Enters text and commands — the primary input device for typing.',
    examples: ['USB keyboard', 'Wireless keyboard'],
    related: ['d-monitor', 'd-mouse', 'd-cpu'],
    syllabus: ['2.1 Input and output devices'],
    selectable: true,
    verified: true,
  },
  {
    id: 'd-mouse',
    scene: 'desktop',
    name: 'Mouse',
    aliases: ['pointing device'],
    category: 'peripheral',
    description:
      'A pointing device that moves the on-screen cursor. An optical sensor tracks movement across a surface thousands of times per second, and buttons and a scroll wheel send clicks to the operating system.',
    function:
      'Controls the cursor for pointing, clicking and scrolling — the main pointing input device.',
    examples: ['Optical USB mouse', 'Wireless mouse'],
    related: ['d-monitor', 'd-keyboard'],
    syllabus: ['2.1 Input and output devices'],
    selectable: true,
    verified: true,
  },
  // ------------------------------------------------------------ motherboard
  {
    id: 'm-cpu-socket',
    scene: 'motherboard',
    name: 'CPU socket',
    aliases: ['processor socket', 'LGA socket', 'CPU slot'],
    category: 'motherboard',
    description:
      'The square socket the processor sits in. Its hundreds of tiny pins (or contact pads, in LGA sockets) connect the CPU to the motherboard’s power and data traces. A metal lever locks the chip in place. The socket type must match the CPU — you cannot fit an incompatible processor.',
    function:
      'Electrically connects the CPU to the motherboard and holds it firmly in place.',
    examples: ['LGA1700 socket', 'AM5 socket'],
    related: ['d-cpu', 'm-vrm', 'm-cpu-power', 'm-chipset'],
    syllabus: ['1.1 Computer systems', '1.3 Hardware'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-dimm',
    scene: 'motherboard',
    name: 'RAM slots (DIMM)',
    aliases: ['memory slots', 'DIMM slots', 'RAM slots'],
    category: 'memory',
    description:
      'Long slots that hold the RAM modules. They are usually colour-coded in pairs because installing two identical sticks enables dual-channel mode, which doubles memory bandwidth. The plastic clips at each end lock the modules in.',
    function:
      'Hold the RAM modules and connect them to the CPU’s memory controller.',
    examples: ['DDR5 DIMM slots ×4'],
    related: ['d-ram', 'm-cpu-socket'],
    syllabus: ['1.1 Computer systems', '1.3 Hardware'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-pcie',
    scene: 'motherboard',
    name: 'PCI Express slots',
    aliases: ['PCIe', 'expansion slots', 'x16 slot'],
    category: 'connectivity',
    description:
      'Long expansion slots for add-in cards. The top x16 slot usually holds the graphics card; shorter x1 slots take Wi-Fi cards, sound cards or extra USB controllers. “x16” means 16 data lanes — more lanes, more bandwidth.',
    function:
      'Provide a high-speed connection for expansion cards such as graphics cards.',
    examples: ['PCIe 4.0 x16', 'PCIe x1'],
    related: ['d-gpu', 'm-chipset'],
    syllabus: ['1.1 Computer systems', '1.3 Hardware'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-m2',
    scene: 'motherboard',
    name: 'M.2 slot',
    aliases: ['NVMe slot', 'M.2 connector'],
    category: 'storage',
    description:
      'A small horizontal slot for M.2 SSDs — the stick-shaped drives that sit directly on the motherboard. It connects the SSD to the CPU over PCI Express lanes, giving several times the speed of SATA. Many boards include a metal heatsink that screws down over the drive.',
    function:
      'Connects an NVMe SSD directly to high-speed PCIe lanes for fast storage.',
    examples: ['M.2 2280 NVMe slot'],
    related: ['d-ssd', 'm-sata', 'm-pcie'],
    syllabus: ['1.3 Hardware', '3.2 Storage'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-sata',
    scene: 'motherboard',
    name: 'SATA connectors',
    aliases: ['SATA ports', 'serial ATA'],
    category: 'connectivity',
    description:
      'L-shaped ports where SATA data cables plug in, linking hard disks and SATA SSDs to the motherboard. Each port handles one drive, and the chipset manages the traffic.',
    function:
      'Connect 2.5" SSDs and hard disks to the system via SATA data cables.',
    examples: ['SATA III 6 Gb/s ports ×4'],
    related: ['d-hdd', 'd-ssd', 'm-chipset'],
    syllabus: ['1.3 Hardware', '3.2 Storage'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-chipset',
    scene: 'motherboard',
    name: 'Chipset',
    aliases: ['PCH', 'platform controller hub'],
    category: 'motherboard',
    description:
      'A second major chip on the board that acts as a traffic manager: it handles USB ports, SATA drives, audio, networking and slower PCIe lanes, while the CPU talks directly to RAM and the graphics card. It sits under its own heatsink.',
    function:
      'Manages communication between the CPU and slower peripherals such as USB, SATA and audio.',
    examples: ['Intel B760 chipset', 'AMD B650 chipset'],
    related: ['m-cpu-socket', 'm-sata', 'm-rear-io'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-vrm',
    scene: 'motherboard',
    name: 'VRM (voltage regulator)',
    aliases: ['power stages', 'MOSFETs', 'voltage regulator module'],
    category: 'power',
    description:
      'The cluster of components around the CPU socket that converts the 12 V from the power supply into the ~1 V the processor needs, delivered smoothly and in huge currents. Better VRMs mean a more stable CPU, especially under heavy load.',
    function:
      'Converts and regulates power for the CPU; keeps voltage stable and clean.',
    examples: ['12+1 phase VRM'],
    related: ['m-cpu-socket', 'm-cpu-power', 'd-cpu'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-cmos',
    scene: 'motherboard',
    name: 'CMOS battery',
    aliases: ['CR2032', 'coin cell battery', 'RTC battery'],
    category: 'firmware',
    description:
      'A small coin-cell battery (usually CR2032) that keeps the real-time clock running and preserves BIOS/UEFI settings when the computer is unplugged. If it dies, the clock resets and custom settings are lost — replacing the battery fixes it.',
    function:
      'Powers the clock and settings memory when the PC is switched off or unplugged.',
    examples: ['CR2032 lithium cell'],
    related: ['m-bios', 'm-cpu-socket'],
    syllabus: ['1.1 Computer systems', '4.1 Software'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-bios',
    scene: 'motherboard',
    name: 'BIOS/UEFI firmware chip',
    aliases: ['firmware chip', 'UEFI', 'BIOS chip', 'SPI flash'],
    category: 'firmware',
    description:
      'A small flash-memory chip holding the firmware — the first software that runs when you press the power button. It initialises the hardware, runs the power-on self-test (POST), and then hands control to the bootloader on your drive.',
    function:
      'Starts the computer: initialises hardware, runs POST, and loads the operating system bootloader.',
    examples: ['128 Mb SPI flash', 'UEFI firmware'],
    related: ['m-cmos', 'd-ssd', 'm-cpu-socket'],
    syllabus: ['4.1 Software', '1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-atx-power',
    scene: 'motherboard',
    name: '24-pin ATX power connector',
    aliases: ['ATX 24-pin', 'main power connector'],
    category: 'power',
    description:
      'The wide 24-pin socket where the main power cable from the PSU plugs in. It feeds the motherboard itself, the chipset, RAM slots and expansion slots.',
    function:
      'Delivers main power from the PSU to the motherboard and its slots.',
    examples: ['24-pin ATX12V'],
    related: ['d-psu', 'm-cpu-power', 'd-cables'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-cpu-power',
    scene: 'motherboard',
    name: '8-pin CPU power connector',
    aliases: ['EPS 12V', 'CPU 8-pin', 'ATX12V'],
    category: 'power',
    description:
      'A dedicated 8-pin connector near the CPU socket that feeds the processor through the VRM. Modern CPUs draw far more current than the 24-pin cable alone could safely provide.',
    function:
      'Supplies dedicated 12 V power for the CPU via the VRM.',
    examples: ['8-pin EPS12V'],
    related: ['d-psu', 'm-atx-power', 'm-vrm'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-rear-io',
    scene: 'motherboard',
    name: 'Rear I/O panel',
    aliases: ['back panel ports', 'I/O shield', 'USB ports'],
    category: 'connectivity',
    description:
      'The cluster of ports on the back of the PC: USB ports for keyboard, mouse and drives, audio jacks, network (Ethernet), and sometimes video outputs. The metal I/O shield grounds the board and blocks dust.',
    function:
      'Exposes the motherboard’s USB, audio, network and display ports to the outside of the case.',
    examples: ['USB-A', 'USB-C', 'RJ45 Ethernet', 'HDMI'],
    related: ['d-keyboard', 'd-mouse', 'd-monitor', 'm-chipset'],
    syllabus: ['2.1 Input and output devices', '1.3 Hardware'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-fan-headers',
    scene: 'motherboard',
    name: 'Fan headers',
    aliases: ['SYS_FAN', 'CPU_FAN', '4-pin fan header'],
    category: 'cooling',
    description:
      'Small 3- or 4-pin connectors where case and CPU fans plug in. The 4-pin versions use PWM to control fan speed precisely — the motherboard spins fans faster only when temperatures rise, keeping noise down.',
    function:
      'Power and speed-control case and CPU fans based on temperature.',
    examples: ['CPU_FAN', 'SYS_FAN1'],
    related: ['d-case-fans', 'd-cpu-cooler', 'm-cpu-socket'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
  {
    id: 'm-front-panel',
    scene: 'motherboard',
    name: 'Front panel header',
    aliases: ['F_PANEL', 'case connectors', 'power button pins'],
    category: 'connectivity',
    description:
      'A row of tiny pins along the board’s edge for the case’s power button, reset button, power LED and hard-drive activity LED. They are small and fiddly — the diagram in the motherboard manual is every builder’s best friend.',
    function:
      'Connects the case’s buttons and indicator lights to the motherboard.',
    examples: ['F_PANEL 9-pin block'],
    related: ['d-case', 'm-atx-power'],
    syllabus: ['1.1 Computer systems'],
    selectable: true,
    verified: true,
  },
];

export const componentById = new Map(COMPONENTS.map((c) => [c.id, c]));

export function sceneComponents(scene: 'desktop' | 'motherboard'): AtlasComponent[] {
  return COMPONENTS.filter((c) => c.scene === scene);
}

/** Search across name, aliases and function text (case-insensitive). */
export function searchComponents(query: string, scene?: 'desktop' | 'motherboard'): AtlasComponent[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const pool = scene ? sceneComponents(scene) : COMPONENTS;
  const scored: { c: AtlasComponent; score: number }[] = [];
  for (const c of pool) {
    const name = c.name.toLowerCase();
    let score = -1;
    if (name.startsWith(q)) score = 0;
    else if (c.aliases.some((a) => a.toLowerCase().startsWith(q))) score = 1;
    else if (name.includes(q)) score = 2;
    else if (c.aliases.some((a) => a.toLowerCase().includes(q))) score = 3;
    else if (c.function.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) score = 4;
    if (score >= 0) scored.push({ c, score });
  }
  return scored.sort((a, b) => a.score - b.score || a.c.name.localeCompare(b.c.name)).map((s) => s.c);
}
