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
  { id: 'nguyet', name: 'Đàn nguyệt', latinName: 'The moon lute', tone: 'Sáng vang · tròn trịa', origin: 'Âm nhạc Cung đình & Dân gian', accent: '#e5a05f', symbol: '🌕', image: '/images/Dan_Nguyet_Transparent.png', transparentImage: '/images/Dan_Nguyet_Transparent.png', description: 'Mặt đàn tròn như mặt trăng rằm, mang tiếng đàn sáng vang, đậm đà tình ca quê hương.', history: 'Đàn nguyệt (hay Đàn kìm) giữ vai trò chủ đạo trong nhạc tuồng, chầu văn và đờn ca tài tử Nam Bộ.', facts: ['2 dây tơ/nilon', 'Thân hình tròn trăng', 'Phím đàn khá cao'] },
  { id: 'tyba', name: 'Đàn tỳ bà', latinName: 'The pear-shaped lute', tone: 'Tung bọt sóng · mềm mại', origin: 'Cung đình Huế & Nhạc cổ', accent: '#c97a48', symbol: '琵', image: '/images/Dan_Ty_Ba_Transparent.png', transparentImage: '/images/Dan_Ty_Ba_Transparent.png', description: 'Hình dáng quả lê sang trọng, âm sắc phong phú khi rung ngón và vê dây ngón trỏ.', history: 'Đàn tỳ bà có lịch sử lâu đời trong dàn nhạc Nhã nhạc Cung đình Huế, tượng trưng cho sự tao nhã và quý phái.', facts: ['4 dây đàn', 'Cần đàn uốn cong', 'Kỹ thuật vê ngón đặc sắc'] },
  { id: 'nhi', name: 'Đàn nhị', latinName: 'The Vietnamese 2-string fiddle', tone: 'Da diết · sâu lắng', origin: 'Dàn nhạc Truyền thống', accent: '#ab5738', symbol: '🎻', image: '/images/Dan_Nhi_Transparent.png', transparentImage: '/images/Dan_Nhi_Transparent.png', description: 'Chỉ với 2 dây và vĩ kéo kéo qua khe, tiếng đàn nhị như lời tâm sự thì thầm của tâm hồn.', history: 'Đàn nhị có mặt ở hầu hết các bộ môn nghệ thuật truyền thống từ Hát xẩm, Chèo, Tuồng đến Nhã nhạc Cung đình.', facts: ['2 dây đàn', 'Vĩ kéo nằm giữa 2 dây', 'Bao bọc da trăn/rắn'] },
  { id: 'bau', name: 'Đàn bầu', latinName: 'The monochord', tone: 'Mộc mạc · da diết', origin: 'Âm nhạc Việt Nam', accent: '#b55d39', symbol: '◒', image: '/images/Dan_Bau.jpg', transparentImage: '/images/Dan_Bau_Transparent.png', description: 'Chỉ một dây đàn nhưng có thể cất lên tiếng nói đầy thổn thức bằng cần ngựa và hộp cộng hưởng.', history: 'Đàn bầu là một biểu tượng độc đáo của âm nhạc Việt Nam. Từ một dây duy nhất, nghệ nhân tạo ra những âm luyến như giọng hát của con người.', facts: ['1 dây đàn', 'Cần rung điều âm', 'Âm sắc da diết'] },
  { id: 'sao', name: 'Sáo trúc', latinName: 'The bamboo flute', tone: 'Bay bổng · gần gũi', origin: 'Làng quê Việt Nam', accent: '#4f8f83', symbol: '◌', image: '/images/Sao_Truc.jpg', transparentImage: '/images/Sao_Truc_Transparent.png', description: 'Ống tre nhỏ mang theo tiếng gió, tiếng đồng quê và những giai điệu Việt Nam thân thuộc.', history: 'Sáo trúc đi qua nhiều không gian của người Việt, từ đồng quê, sân khấu chèo đến những bản phối hiện đại. Tiếng sáo luôn gợi cảm giác tự do và gần gũi.', facts: ['6 lỗ bấm', 'Thổi ngang', 'Thân bằng tre/trúc'] },
  { id: 'tranh', name: 'Đàn tranh', latinName: 'The Vietnamese zither', tone: 'Trong veo · ngân dài', origin: 'Miền Bắc Việt Nam', accent: '#d98b46', symbol: '弦', image: '/images/Dan_Tranh.jpg', transparentImage: '/images/Dan_Tranh_Transparent.png', description: 'Những dây tơ rung lên thành các lớp âm thanh trong trẻo, mềm và rất giàu sắc thái.', history: 'Đàn tranh hiện diện trong các dàn nhạc truyền thống Việt Nam từ nhiều thế kỷ, thường kể những câu chuyện mềm mại bằng tiếng dây ngân.', facts: ['16 dây tơ', 'Gảy bằng móng', 'Âm sắc trong trẻo'] },
  { id: 'day', name: 'Đàn đáy', latinName: 'The đáy lute', tone: 'Trầm ấm · cổ điển', origin: 'Nghệ thuật ca trù', accent: '#7e8f68', symbol: '◫', image: '/images/Dan_Day.jpg', transparentImage: '/images/Dan_Day_Transparent.png', description: 'Âm sắc trầm, gọn và sang, gắn với không gian bác học của nghệ thuật ca trù.', history: 'Đàn đáy là nhạc cụ đệm quan trọng trong ca trù, đối thoại cùng tiếng phách và giọng hát để tạo nên không gian thính phòng đặc biệt.', facts: ['3 dây đàn', 'Gắn với ca trù', 'Thân đàn hình thang'] },
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

export type QuizQuestion = {
  id: number;
  prompt: string;
  options: { id: number; text: string }[];
  correctOptionId: number;
  explanation: string;
};

export type QuizData = {
  id: number;
  title: string;
  passPercentage: number;
  xpReward: number;
  questions: QuizQuestion[];
};

export const mockQuizData: QuizData = {
  id: 501,
  title: 'Trắc nghiệm kiến thức Sáo Trúc nhập môn',
  passPercentage: 80,
  xpReward: 150,
  questions: [
    {
      id: 1,
      prompt: 'Sáo trúc truyền thống Việt Nam thông thường có bao nhiêu lỗ bấm?',
      options: [
        { id: 1, text: '4 lỗ bấm' },
        { id: 2, text: '6 lỗ bấm' },
        { id: 3, text: '10 lỗ bấm' },
        { id: 4, text: '12 lỗ bấm' },
      ],
      correctOptionId: 2,
      explanation: 'Sáo trúc truyền thống chuẩn 6 lỗ bấm gồm 6 lỗ bấm ngón và 1 lỗ thổi.',
    },
    {
      id: 2,
      prompt: 'Kỹ thuật định hình môi để thổi sáo trúc tạo ra âm thanh chuẩn gọi là gì?',
      options: [
        { id: 1, text: 'Khấu khẩu' },
        { id: 2, text: 'Thế môi (Emouchure)' },
        { id: 3, text: 'Rung ngón' },
        { id: 4, text: 'Đánh lưỡi' },
      ],
      correctOptionId: 2,
      explanation: 'Thế môi (Emouchure) là việc mím nhẹ môi và tạo khe hẹp để luồng hơi đi thẳng vào mép lỗ thổi.',
    },
    {
      id: 3,
      prompt: 'Âm sắc đặc trưng của Sáo Trúc Việt Nam thường gợi cảm giác như thế nào?',
      options: [
        { id: 1, text: 'U tối, nặng nề' },
        { id: 2, text: 'Bay bổng, mộc mạc và gần gũi' },
        { id: 3, text: 'Điện tử, hiện đại' },
        { id: 4, text: 'Đanh cứng, chói tai' },
      ],
      correctOptionId: 2,
      explanation: 'Sáo trúc mang âm hưởng làng quê Việt Nam, tiếng mộc mạc, tự do và bay bổng.',
    },
    {
      id: 4,
      prompt: 'Khi bấm kín tất cả 6 lỗ bấm trên cây sáo Đô (C5), ta sẽ phát ra nốt âm nào?',
      options: [
        { id: 1, text: 'Nốt Đô (C)' },
        { id: 2, text: 'Nốt Rê (D)' },
        { id: 3, text: 'Nốt Mi (E)' },
        { id: 4, text: 'Nốt Sol (G)' },
      ],
      correctOptionId: 1,
      explanation: 'Khi bấm bịt kín toàn bộ 6 lỗ ngón và thổi nhẹ, cột không khí dài nhất tạo ra nốt trầm nhất là nốt Đô (C).',
    },
    {
      id: 5,
      prompt: 'Đặc điểm nào giúp tiếng Sáo Trúc ngân vang và thanh thoát?',
      options: [
        { id: 1, text: 'Dùng màng sáo hoặc kỹ thuật điều tiết cột hơi bụng' },
        { id: 2, text: 'Căng dây thép' },
        { id: 3, text: 'Dùng phím gảy nhựa' },
        { id: 4, text: 'Lắp thêm loa khuếch đại' },
      ],
      correctOptionId: 1,
      explanation: 'Hơi bụng kết hợp với rung ngón và màng sáo giúp tiếng sáo trúc có độ ngân vang đặc sắc.',
    },
  ],
};

export const mockLessons = [
  { id: 101, title: 'Giới thiệu về Sáo Trúc Việt Nam', type: 'Theory', duration: '8 phút', done: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', content: 'Sáo trúc là nhạc cụ hơi phổ biến ở Việt Nam. Được làm từ ống trúc hoặc ống tre, sáo trúc mang đến âm thanh mộc mạc nhưng vô cùng truyền cảm.' },
  { id: 102, title: 'Cách cầm sáo và tư thế thổi', type: 'Video', duration: '7 phút', done: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', content: 'Giữ vai thả lỏng, hai tay đặt nhẹ nhàng lên các lỗ bấm. Góc thổi nghiêng khoảng 45 độ so với cơ thể.' },
  { id: 103, title: 'Kỹ thuật thở và tạo âm thanh', type: 'Theory', duration: '10 phút', done: true, content: 'Sử dụng hơi bụng (thở cơ hoành) thay vì hơi ngực. Hơi bụng giúp âm thanh dày, ấm và giữ được nốt dài.' },
  { id: 104, title: 'Luyện gam Đô trưởng', type: 'Practical', duration: '15 phút', done: false },
  { id: 105, title: 'Trắc nghiệm kiến thức nhập môn', type: 'Quiz', duration: '5 câu hỏi', done: false },
];

