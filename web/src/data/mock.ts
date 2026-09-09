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
  family: 'Họ dây' | 'Họ hơi';
  materials: string;
  playingStyle: string;
  culturalContext: string;
  culturalValue: string;
};

export const instruments: Instrument[] = [
  { id: 'nguyet', name: 'Đàn nguyệt', latinName: 'The moon lute', tone: 'Sáng vang · tròn trịa', origin: 'Cung đình, dân gian và sân khấu truyền thống', accent: '#e5a05f', symbol: '🌕', image: '/images/Dan_Nguyet_Transparent.png', transparentImage: '/images/Dan_Nguyet_Transparent.png', description: 'Mặt đàn tròn như vầng trăng, tiếng đàn sáng, vang và có khả năng luyến láy giàu biểu cảm.', history: 'Đàn nguyệt, còn được gọi là đàn kìm ở Nam Bộ, đã đi vào nhiều loại hình âm nhạc của người Việt. Qua thời gian, cây đàn trở thành một giọng kể quen thuộc trong dàn nhạc truyền thống.', facts: ['Hai dây, mặt đàn tròn', 'Cần dài với các phím nổi cao', 'Âm thanh biến hóa nhờ kỹ thuật nhấn và rung'], family: 'Họ dây', materials: 'Gỗ, dây tơ hoặc nylon', playingStyle: 'Gảy dây bằng miếng gảy', culturalContext: 'Có mặt trong hát chầu văn, tuồng, chèo và đờn ca tài tử. Ở mỗi không gian, lối nhấn rung lại tạo nên một sắc thái địa phương riêng.', culturalValue: 'Gợi vẻ thanh nhã nhưng linh hoạt, kết nối âm nhạc cung đình, tín ngưỡng và sinh hoạt dân gian.' },
  { id: 'tyba', name: 'Đàn tỳ bà', latinName: 'The pear-shaped lute', tone: 'Trong sáng · mềm mại', origin: 'Nhã nhạc cung đình Huế và nhạc cổ', accent: '#c97a48', symbol: '琵', image: '/images/Dan_Ty_Ba_Transparent.png', transparentImage: '/images/Dan_Ty_Ba_Transparent.png', description: 'Thân đàn hình quả lê và bốn dây tạo nên âm sắc trong sáng, khi khoan thai, khi rộn ràng.', history: 'Tỳ bà có lịch sử giao lưu lâu dài trong khu vực châu Á. Khi đi vào đời sống âm nhạc Việt Nam, nhạc cụ được Việt hóa trong hình dáng, hệ thống âm và kỹ thuật trình diễn.', facts: ['Bốn dây, thân hình quả lê', 'Cần đàn uốn cong về phía sau', 'Nổi bật với kỹ thuật vê và rung ngón'], family: 'Họ dây', materials: 'Gỗ, dây tơ hoặc nylon', playingStyle: 'Gảy bằng móng hoặc đầu ngón', culturalContext: 'Là một thành viên của dàn Nhã nhạc cung đình Huế, đồng thời xuất hiện trong các hòa tấu nhạc cổ và sân khấu truyền thống.', culturalValue: 'Phản ánh quá trình tiếp biến văn hóa: tiếp nhận ảnh hưởng khu vực rồi tạo nên tiếng đàn mang thẩm mỹ Việt.' },
  { id: 'nhi', name: 'Đàn nhị', latinName: 'The Vietnamese two-string fiddle', tone: 'Da diết · sâu lắng', origin: 'Dàn nhạc dân gian và sân khấu truyền thống', accent: '#ab5738', symbol: '🎻', image: '/images/Dan_Nhi_Transparent.png', transparentImage: '/images/Dan_Nhi_Transparent.png', description: 'Hai dây và chiếc vĩ nhỏ tạo nên tiếng đàn gần với giọng người, có thể nỉ non, sâu lắng hoặc đầy kịch tính.', history: 'Đàn nhị là một nhạc cụ dây kéo quen thuộc trong nhiều cộng đồng và loại hình nghệ thuật Việt Nam. Cấu trúc gọn nhẹ giúp tiếng đàn hiện diện từ những gánh hát dân gian đến dàn nhạc sân khấu.', facts: ['Hai dây, không có phím', 'Lông vĩ nằm giữa hai dây', 'Bầu cộng hưởng nhỏ tạo âm sắc tập trung'], family: 'Họ dây', materials: 'Gỗ, dây đàn và màng cộng hưởng', playingStyle: 'Kéo vĩ, nhấn dây bằng ngón', culturalContext: 'Đồng hành với hát xẩm, chèo, tuồng, cải lương và nhiều dàn nhạc dân tộc. Tiếng đàn thường đảm nhiệm những tuyến giai điệu giàu cảm xúc.', culturalValue: 'Là tiếng nói trữ tình gần với lời ca, lưu giữ khả năng kể chuyện và biểu đạt nội tâm của sân khấu dân gian.' },
  { id: 'bau', name: 'Đàn bầu', latinName: 'The monochord', tone: 'Mộc mạc · da diết', origin: 'Âm nhạc dân gian Việt Nam', accent: '#b55d39', symbol: '◒', image: '/images/Dan_Bau.jpg', transparentImage: '/images/Dan_Bau_Transparent.png', description: 'Chỉ một dây đàn nhưng có thể tạo nên những đường luyến mềm mại và sắc thái gần với tiếng nói con người.', history: 'Từ hình thức mộc mạc của người hát rong, đàn bầu dần bước lên sân khấu chuyên nghiệp và trở thành một trong những nhạc cụ dễ nhận diện nhất của âm nhạc Việt Nam.', facts: ['Chỉ có một dây', 'Âm thanh dựa trên hệ bồi âm', 'Cần rung làm thay đổi cao độ'], family: 'Họ dây', materials: 'Gỗ, dây kim loại và cần đàn', playingStyle: 'Gảy dây kết hợp chạm bồi âm và uốn cần', culturalContext: 'Xuất hiện trong độc tấu, hòa tấu nhạc dân tộc và các bản phối đương đại. Khả năng luyến âm khiến đàn bầu đặc biệt phù hợp với những giai điệu trữ tình.', culturalValue: 'Một biểu tượng của sự tinh giản: từ một dây duy nhất mở ra thế giới âm thanh giàu sắc thái và rất Việt Nam.' },
  { id: 'sao', name: 'Sáo trúc', latinName: 'The bamboo flute', tone: 'Bay bổng · gần gũi', origin: 'Làng quê và sân khấu dân gian', accent: '#4f8f83', symbol: '◌', image: '/images/Sao_Truc.jpg', transparentImage: '/images/Sao_Truc_Transparent.png', description: 'Một ống tre nhỏ mang theo tiếng gió, tiếng đồng quê và những giai điệu thân thuộc trong ký ức Việt.', history: 'Sáo trúc gắn với môi trường sống giàu tre nứa và xuất hiện lâu đời trong sinh hoạt cộng đồng. Từ tiếng sáo mục đồng, nhạc cụ đi vào sân khấu và các dàn nhạc hiện đại.', facts: ['Thân là một ống tre hoặc trúc', 'Phổ biến với kiểu thổi ngang', 'Cao độ thay đổi bằng hệ thống lỗ bấm'], family: 'Họ hơi', materials: 'Tre hoặc trúc', playingStyle: 'Thổi ngang, điều khiển luồng hơi và ngón bấm', culturalContext: 'Tiếng sáo có mặt trong đời sống thôn quê, chèo và nhiều hình thức biểu diễn mới. Chất liệu tre khiến nhạc cụ gắn chặt với cảnh quan và nếp sống bản địa.', culturalValue: 'Mang hình ảnh thiên nhiên vào âm nhạc, gợi sự phóng khoáng, bình dị và mối liên hệ giữa con người với làng quê.' },
  { id: 'tranh', name: 'Đàn tranh', latinName: 'The Vietnamese zither', tone: 'Trong veo · ngân dài', origin: 'Âm nhạc truyền thống ba miền', accent: '#d98b46', symbol: '弦', image: '/images/Dan_Tranh.jpg', transparentImage: '/images/Dan_Tranh_Transparent.png', description: 'Dàn dây trải dài trên mặt gỗ tạo nên những lớp âm trong trẻo, mềm mại và giàu sắc thái.', history: 'Đàn tranh thuộc họ đàn dây gảy dạng hộp dài và đã được người Việt điều chỉnh qua nhiều thế hệ. Nhạc cụ tiếp tục thay đổi về số dây để đáp ứng nhu cầu biểu diễn ngày nay.', facts: ['Dây đàn căng dọc trên hộp cộng hưởng', 'Mỗi dây đi qua một con nhạn di động', 'Tay phải gảy, tay trái nhấn và rung'], family: 'Họ dây', materials: 'Gỗ, dây kim loại và con nhạn', playingStyle: 'Gảy bằng móng, kết hợp nhấn rung', culturalContext: 'Hiện diện trong ca Huế, đờn ca tài tử, hòa tấu dân tộc và biểu diễn đương đại. Cách nhấn bên trái cầu đàn tạo nên các luyến âm đặc trưng.', culturalValue: 'Thể hiện thẩm mỹ tinh tế của âm nhạc truyền thống và khả năng thích nghi bền bỉ trong đời sống hiện đại.' },
  { id: 'day', name: 'Đàn đáy', latinName: 'The đáy lute', tone: 'Trầm ấm · cổ kính', origin: 'Không gian nghệ thuật ca trù', accent: '#7e8f68', symbol: '◫', image: '/images/Dan_Day.jpg', transparentImage: '/images/Dan_Day_Transparent.png', description: 'Cần đàn rất dài, thân hình thang và tiếng đàn trầm gọn tạo nên một diện mạo không thể nhầm lẫn của ca trù.', history: 'Đàn đáy phát triển trong mối quan hệ đặc biệt với nghệ thuật ca trù. Tên gọi thường được liên hệ với phần đáy đàn đặc trưng, và âm thanh của đàn được định hình để đối thoại cùng giọng hát, tiếng phách.', facts: ['Ba dây và cần đàn rất dài', 'Thân đàn hình thang', 'Âm thanh trầm, khô và gọn'], family: 'Họ dây', materials: 'Gỗ và dây đàn', playingStyle: 'Gảy dây, phối hợp nhấn và chặn tiếng', culturalContext: 'Trong một chầu hát ca trù, đàn đáy hòa cùng tiếng phách của đào nương và tiếng trống chầu của người thưởng thức, tạo thành một cuộc đối thoại tinh tế.', culturalValue: 'Không chỉ đệm hát, đàn đáy là một thành phần nhận diện của ca trù và văn hóa thưởng thức thính phòng truyền thống.' },
];

export const mockCourses = [
  { id: 1, title: 'Sáo trúc: Những nốt đầu tiên', instrument: 'Sáo trúc', level: 'Beginner', progress: 68, lessons: 12, duration: '3 giờ 20 phút', color: '#4f8f83' },
  { id: 2, title: 'Đàn tranh nhập môn', instrument: 'Đàn tranh', level: 'Beginner', progress: 24, lessons: 16, duration: '4 giờ 10 phút', color: '#d98b46' },
  { id: 3, title: 'Lắng nghe đàn bầu', instrument: 'Đàn bầu', level: 'Beginner', progress: 0, lessons: 10, duration: '2 giờ 45 phút', color: '#b55d39' },
  { id: 4, title: 'Đàn đáy và âm sắc ca trù', instrument: 'Đàn đáy', level: 'Beginner', progress: 0, lessons: 8, duration: '2 giờ 15 phút', color: '#7e8f68' },
];

export const learningPath = [
  { number: '01', title: 'Làm quen', status: 'done', type: 'Video' },
  { number: '02', title: 'Kiến thức', status: 'done', type: 'Lý thuyết' },
  { number: '03', title: 'Kỹ thuật', status: 'current', type: 'Thực hành' },
  { number: '04', title: 'Thực hành', status: 'locked', type: 'Thực hành' },
  { number: '05', title: 'Trắc nghiệm', status: 'locked', type: 'Trắc nghiệm' },
  { number: '06', title: 'Thử thách', status: 'locked', type: 'Thử thách' },
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

