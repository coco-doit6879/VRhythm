export type Instrument = {
  id: string;
  name: string;
  latinName: string;
  tone: string;
  origin: string;
  accent: string;
  symbol: string;
  image: string;
  transparentImage?: string;
  description: string;
  history: string;
  facts: string[];
};

export const instruments: Instrument[] = [
  { id: 'tranh', name: 'Đàn tranh', latinName: 'The Vietnamese zither', tone: 'Trong veo · ngân dài', origin: 'Miền Bắc Việt Nam', accent: '#d98b46', symbol: '弦', image: '/images/Dan_Tranh.jpg',transparentImage:'/images/Dan_Tranh_Transparent.png', description: 'Những dây tơ rung lên thành các lớp âm thanh trong trẻo, mềm và rất giàu sắc thái.', history: 'Đàn tranh hiện diện trong các dàn nhạc truyền thống Việt Nam từ nhiều thế kỷ, thường kể những câu chuyện mềm mại bằng tiếng dây ngân.', facts: ['16 dây tơ', 'Gảy bằng móng', 'Âm sắc trong trẻo'] },
  { id: 'bau', name: 'Đàn bầu', latinName: 'The monochord', tone: 'Mộc mạc · da diết', origin: 'Âm nhạc Việt Nam', accent: '#b55d39', symbol: '◒', image: '/images/Dan_Bau.jpg', transparentImage: '/images/Dan_Bau_Transparent.png', description: 'Chỉ một dây đàn nhưng có thể cất lên tiếng nói đầy thổn thức bằng cần ngựa và hộp cộng hưởng.', history: 'Đàn bầu là một biểu tượng độc đáo của âm nhạc Việt Nam. Từ một dây duy nhất, nghệ nhân tạo ra những âm luyến như giọng hát của con người.', facts: ['1 dây đàn', 'Cần rung điều âm', 'Âm sắc da diết'] },
  { id: 'day', name: 'Đàn đáy', latinName: 'The đáy lute', tone: 'Trầm ấm · cổ điển', origin: 'Nghệ thuật ca trù', accent: '#7e8f68', symbol: '◫', image: '/images/Dan_Day.jpg', transparentImage: '/images/Dan_Day_Transparent.png', description: 'Âm sắc trầm, gọn và sang, gắn với không gian bác học của nghệ thuật ca trù.', history: 'Đàn đáy là nhạc cụ đệm quan trọng trong ca trù, đối thoại cùng tiếng phách và giọng hát để tạo nên không gian thính phòng đặc biệt.', facts: ['3 dây đàn', 'Gắn với ca trù', 'Thân đàn hình thang'] },
  { id: 'sao', name: 'Sáo trúc', latinName: 'The bamboo flute', tone: 'Bay bổng · gần gũi', origin: 'Làng quê Việt Nam', accent: '#4f8f83', symbol: '◌', image: '/images/Sao_Truc.jpg', transparentImage: '/images/Sao_Truc_Transparent.png', description: 'Ống tre nhỏ mang theo tiếng gió, tiếng đồng quê và những giai điệu Việt Nam thân thuộc.', history: 'Sáo trúc đi qua nhiều không gian của người Việt, từ đồng quê, sân khấu chèo đến những bản phối hiện đại. Tiếng sáo luôn gợi cảm giác tự do và gần gũi.', facts: ['6 lỗ bấm', 'Thổi ngang', 'Thân bằng tre/trúc'] },
];

export const mockCourses = [
  { id: 1, title: 'Sáo trúc: Những nốt đầu tiên', instrument: 'Sáo trúc', level: 'Beginner', progress: 68, lessons: 12, duration: '3 giờ 20 phút', color: '#4f8f83' },
  { id: 2, title: 'Đàn tranh nhập môn', instrument: 'Đàn tranh', level: 'Beginner', progress: 24, lessons: 16, duration: '4 giờ 10 phút', color: '#d98b46' },
  { id: 3, title: 'Lắng nghe đàn bầu', instrument: 'Đàn bầu', level: 'Beginner', progress: 0, lessons: 10, duration: '2 giờ 45 phút', color: '#b55d39' },
];

export const learningPath = [
  { number: '01', title: 'Làm quen', status: 'done', type: 'Video' },
  { number: '02', title: 'Kiến thức', status: 'done', type: 'Theory' },
  { number: '03', title: 'Kỹ thuật', status: 'current', type: 'Practice' },
  { number: '04', title: 'Thực hành', status: 'locked', type: 'Practice' },
  { number: '05', title: 'Quiz', status: 'locked', type: 'Quiz' },
  { number: '06', title: 'Challenge', status: 'locked', type: 'Challenge' },
];

export const bambooFluteScore = {
  metadata: { title: 'Luyện gam Đô trưởng', composer: 'VRhythm', tempo: 80 },
  notes: ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'].map((pitch, index) => ({
    id: `n${index + 1}`, pitch, duration: 'q',
  })),
};

export const mockLessons = [
  { id: 101, title: 'Giới thiệu về Sáo Trúc Việt Nam', type: 'Theory', duration: '8 phút', done: true },
  { id: 102, title: 'Cách cầm sáo và tư thế', type: 'Video', duration: '7 phút', done: true },
  { id: 103, title: 'Kỹ thuật thở và tạo âm thanh', type: 'Theory', duration: '10 phút', done: true },
  { id: 104, title: 'Luyện gam Đô trưởng', type: 'Practical', duration: '15 phút', done: false },
  { id: 105, title: 'Trắc nghiệm kiến thức nhập môn', type: 'Quiz', duration: '5 câu hỏi', done: false },
];
