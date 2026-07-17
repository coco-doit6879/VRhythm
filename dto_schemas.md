# API DTO Schemas

## AuthResponseDto.cs

``csharp
namespace VRhythm.Application.Contracts.Auth;

public sealed record AuthResponseDto
{
    public int UserId { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string Token { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
    public string AuthProvider { get; init; } = "local";
}
``

## GoogleLoginRequestDto.cs

``csharp
using System.ComponentModel.DataAnnotations;

namespace VRhythm.Application.Contracts.Auth;

public sealed record GoogleLoginRequestDto
{
    [Required]
    public string Credential { get; init; } = string.Empty;

    [Required]
    public string Subject { get; init; } = string.Empty;

    [Required, EmailAddress, MaxLength(320)]
    public string Email { get; init; } = string.Empty;

    [Required, MaxLength(200)]
    public string FullName { get; init; } = string.Empty;

    public string? AvatarUrl { get; init; }
}
``

## LoginRequestDto.cs

``csharp
using System.ComponentModel.DataAnnotations;

namespace VRhythm.Application.Contracts.Auth;

public sealed record LoginRequestDto
{
    [Required, EmailAddress, MaxLength(320)]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}
``

## RegisterRequestDto.cs

``csharp
using System.ComponentModel.DataAnnotations;

namespace VRhythm.Application.Contracts.Auth;

public sealed record RegisterRequestDto
{
    [Required, MaxLength(200)]
    public string FullName { get; init; } = string.Empty;

    [Required, EmailAddress, MaxLength(320)]
    public string Email { get; init; } = string.Empty;

    [Required, MinLength(8), MaxLength(200)]
    public string Password { get; init; } = string.Empty;

    [Required, Compare(nameof(Password))]
    public string ConfirmPassword { get; init; } = string.Empty;
}
``

## UserProfileDto.cs

``csharp
namespace VRhythm.Application.Contracts.Auth;

public sealed record UserProfileDto
{
    public int UserId { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
}
``

## ChapterDto.cs

``csharp
namespace VRhythm.Application.Contracts.Courses;

public sealed record ChapterDto
{
    public int Id { get; init; }
    public int SortOrder { get; init; }
    public string Title { get; init; } = string.Empty;
    public IReadOnlyList<LessonDto> Lessons { get; init; } = Array.Empty<LessonDto>();
}
``

## CourseDetailDto.cs

``csharp
namespace VRhythm.Application.Contracts.Courses;

public sealed record CourseDetailDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Instrument { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string AccessType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? RejectionReason { get; init; }
    public bool IsEnrolled { get; init; }
    public bool IsUnlocked { get; init; }
    public bool IsCompleted { get; init; }
    public IReadOnlyList<ChapterDto> Chapters { get; init; } = Array.Empty<ChapterDto>();
    public IReadOnlyList<QuizExamDto> Quizzes { get; init; } = Array.Empty<QuizExamDto>();
    public IReadOnlyList<PracticalExamDto> PracticalExams { get; init; } = Array.Empty<PracticalExamDto>();
}
``

## CourseSummaryDto.cs

``csharp
namespace VRhythm.Application.Contracts.Courses;

public sealed record CourseSummaryDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Instrument { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string AccessType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? ThumbnailUrl { get; init; }
}
``

## CreateChapterRequestDto.cs

``csharp
using System.ComponentModel.DataAnnotations;

namespace VRhythm.Application.Contracts.Courses;

public sealed record CreateChapterRequestDto
{
    [Required]
    public int SortOrder { get; init; }

    [Required, MaxLength(200)]
    public string Title { get; init; } = string.Empty;
}
``

## CreateCourseRequestDto.cs

``csharp
using System.ComponentModel.DataAnnotations;
using VRhythm.Domain.Enums;

namespace VRhythm.Application.Contracts.Courses;

public sealed record CreateCourseRequestDto
{
    [Required, MaxLength(200)]
    public string Title { get; init; } = string.Empty;

    [Required, MaxLength(100)]
    public string Instrument { get; init; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Description { get; init; } = string.Empty;

    public string? ThumbnailUrl { get; init; }

    public CourseAccessType AccessType { get; init; } = CourseAccessType.Free;
}
``

## CreateLessonRequestDto.cs

``csharp
using System.ComponentModel.DataAnnotations;
using VRhythm.Domain.Enums;

namespace VRhythm.Application.Contracts.Courses;

public sealed record CreateLessonRequestDto
{
    [Required]
    public int SortOrder { get; init; }

    [Required, MaxLength(200)]
    public string Title { get; init; } = string.Empty;

    public LessonType Type { get; init; } = LessonType.Theory;

    [MaxLength(5000)]
    public string? Content { get; init; }

    public int? DurationSeconds { get; init; }

    [MaxLength(1000)]
    public string? VideoObjectKey { get; init; }

    [MaxLength(100)]
    public string? VideoContentType { get; init; }
}
``

## LessonDto.cs

``csharp
namespace VRhythm.Application.Contracts.Courses;

public sealed record LessonDto
{
    public int Id { get; init; }
    public int SortOrder { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string? Content { get; init; }
    public int? DurationSeconds { get; init; }
    public bool IsCompleted { get; init; }
}
``

## PracticalExamDto.cs

``csharp
namespace VRhythm.Application.Contracts.Courses;

public sealed record PracticalExamDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public int SortOrder { get; init; }
    public IReadOnlyList<string> ExpectedNotes { get; init; } = Array.Empty<string>();
}
``

## QuizExamDto.cs

``csharp
namespace VRhythm.Application.Contracts.Courses;

public sealed record QuizExamDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public int SortOrder { get; init; }
    public int PassPercentage { get; init; }
    public IReadOnlyList<QuizQuestionDto> Questions { get; init; } = Array.Empty<QuizQuestionDto>();
}
``

## QuizOptionDto.cs

``csharp
namespace VRhythm.Application.Contracts.Courses;

public sealed record QuizOptionDto
{
    public int Id { get; init; }
    public int SortOrder { get; init; }
    public string Text { get; init; } = string.Empty;

}
``

## QuizQuestionDto.cs

``csharp
namespace VRhythm.Application.Contracts.Courses;

public sealed record QuizQuestionDto
{
    public int Id { get; init; }
    public int SortOrder { get; init; }
    public string Prompt { get; init; } = string.Empty;
    public IReadOnlyList<QuizOptionDto> Options { get; init; } = Array.Empty<QuizOptionDto>();
}
``

## RejectCourseRequestDto.cs

``csharp
using System.ComponentModel.DataAnnotations;

namespace VRhythm.Application.Contracts.Courses;

public sealed record RejectCourseRequestDto
{
    [Required, MaxLength(500)]
    public string Reason { get; init; } = string.Empty;
}
``

## SaveNoteRequestDto.cs

``csharp
using System.ComponentModel.DataAnnotations;

namespace VRhythm.Application.Contracts.Courses;

public sealed record SaveNoteRequestDto
{
    public int? LessonId { get; init; }

    [Required, MaxLength(4000)]
    public string Content { get; init; } = string.Empty;
}
``

## UpdateVideoProgressDto.cs

``csharp
using System.ComponentModel.DataAnnotations;

namespace VRhythm.Application.Contracts.Courses;

public sealed record UpdateVideoProgressDto
{
    [Required]
    [Range(0, int.MaxValue)]
    public int WatchedSeconds { get; init; }

    [Required]
    [Range(0, int.MaxValue)]
    public int TotalSeconds { get; init; }
}
``

## PracticalAttemptRequestDto.cs

``csharp
using System.ComponentModel.DataAnnotations;

namespace VRhythm.Application.Contracts.Exams;

public sealed record PracticalAttemptRequestDto
{
    [Required]
    public IReadOnlyList<string> Notes { get; init; } = Array.Empty<string>();
}
``

## PracticalAttemptResultDto.cs

``csharp
namespace VRhythm.Application.Contracts.Exams;

public sealed record PracticalAttemptResultDto
{
    public int AttemptId { get; init; }
    public int ScorePercentage { get; init; }
    public bool Passed { get; init; }
    public int AttemptNumber { get; init; }
    public bool CanSkipNow { get; init; }
    public IReadOnlyList<int> ErrorPositions { get; init; } = Array.Empty<int>();
    public bool CourseCompleted { get; init; }
}
``

## QuizAnswerDto.cs

``csharp
using System.ComponentModel.DataAnnotations;

namespace VRhythm.Application.Contracts.Exams;

public sealed record QuizAnswerDto
{
    [Required]
    public int QuestionId { get; init; }

    [Required]
    public int SelectedOptionId { get; init; }
}
``

## QuizAttemptRequestDto.cs

``csharp
using System.ComponentModel.DataAnnotations;

namespace VRhythm.Application.Contracts.Exams;

public sealed record QuizAttemptRequestDto
{
    [Required]
    public IReadOnlyList<QuizAnswerDto> Answers { get; init; } = Array.Empty<QuizAnswerDto>();
}
``

## QuizAttemptResultDto.cs

``csharp
namespace VRhythm.Application.Contracts.Exams;

public sealed record QuizAttemptResultDto
{
    public int AttemptId { get; init; }
    public int ScorePercentage { get; init; }
    public bool Passed { get; init; }
    public int RequiredPassPercentage { get; init; }
    public IReadOnlyList<int> WrongQuestionIds { get; init; } = Array.Empty<int>();
    public bool CourseCompleted { get; init; }
}
``

## CreatePraticalLessonRequestDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRhythm.Application.Contracts.QuizExams;

namespace VRhythm.Application.Contracts.Lessons
{
    public sealed record CreatePracticalLessonRequestDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        [Required]
        public CreatePracticalExamDto Practical { get; init; } = default!;
    }
}
``

## CreateQuizLessonRequestDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRhythm.Application.Contracts.QuizExams;

namespace VRhythm.Application.Contracts.Lessons
{
    public sealed record CreateQuizLessonRequestDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        [Required]
        public CreateQuizExamDto Quiz { get; init; } = default!;
    }
}
``

## CreateTheoryLessonRequestDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.Lessons
{
    public sealed record CreateTheoryLessonRequestDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        [Required]
        [MaxLength(5000)]
        public string Content { get; init; } = string.Empty;

        public int? DurationSeconds { get; init; }
    }
}
``

## CreateVideoLessonRequestDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.Lessons
{
    public sealed record CreateVideoLessonRequestDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        public string? Content { get; init; }

        [Required]
        public int DurationSeconds { get; init; }

        [Required]
        [MaxLength(1000)]
        public string VideoObjectKey { get; init; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string VideoContentType { get; init; } = string.Empty;
    }
}
``

## LessonDetailDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRhythm.Application.Contracts.QuizExams;
using VRhythm.Domain.Enums;

namespace VRhythm.Application.Contracts.Lessons
{
    public sealed record LessonDetailDto
    {
        public int Id { get; init; }

        public int SortOrder { get; init; }

        public string Title { get; init; } = string.Empty;

        public LessonType Type { get; init; }

        public TheoryLessonDetailDto? Theory { get; init; }

        public VideoLessonDetailDto? Video { get; init; }

        public QuizLessonDetailDto? Quiz { get; init; }

        public PracticalLessonDetailDto? Practical { get; init; }
    }
    public sealed record TheoryLessonDetailDto
    {
        public string? Content { get; init; }

        public int? DurationSeconds { get; init; }
    }
    public sealed record VideoLessonDetailDto
    {
        public string? Content { get; init; }

        public int? DurationSeconds { get; init; }

        public string? VideoObjectKey { get; init; }

        public string? VideoContentType { get; init; }
    }
    public sealed record QuizLessonDetailDto
    {
        public string Title { get; init; } = string.Empty;

        public List<QuizQuestionDetailDto> Questions { get; init; } = [];
    }
}
``

## LessonSummaryDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRhythm.Domain.Enums;

namespace VRhythm.Application.Contracts.Lessons
{
    public sealed record LessonSummaryDto
    {
        public int Id { get; init; }

        public int SortOrder { get; init; }

        public string Title { get; init; } = string.Empty;

        public LessonType Type { get; init; }
    }
}
``

## UpdatePraticalLessonRequestDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRhythm.Application.Contracts.QuizExams;

namespace VRhythm.Application.Contracts.Lessons
{
    public sealed record UpdatePracticalLessonRequestDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        [Required]
        public UpdatePracticalExamRequestDto Practical { get; init; } = default!;
    }
}
``

## UpdateQuizLessonRequestDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRhythm.Application.Contracts.QuizExams;

namespace VRhythm.Application.Contracts.Lessons
{
    public sealed record UpdateQuizLessonRequestDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        [Required]
        public UpdateQuizExamRequestDto Quiz { get; init; } = default!;
    }
}
``

## UpdateTheoryLessonRequestDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.Lessons
{
    public sealed record UpdateTheoryLessonRequestDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        [Required]
        [MaxLength(5000)]
        public string Content { get; init; } = string.Empty;

        public int? DurationSeconds { get; init; }
    }
}
``

## UpdateVideoLessonRequestDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.Lessons
{
    public sealed record UpdateVideoLessonRequestDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        [MaxLength(5000)]
        public string? Content { get; init; }

        [Required]
        public int DurationSeconds { get; init; }

        [Required]
        [MaxLength(1000)]
        public string VideoObjectKey { get; init; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string VideoContentType { get; init; } = string.Empty;
    }
}
``

## CreatePraticalExamDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record CreatePracticalExamDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        [MinLength(1)]
        public List<CreatePracticalNoteDto> Notes { get; init; } = [];
    }
}
``

## CreatePraticalNoteDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record CreatePracticalNoteDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        public string Note { get; init; } = string.Empty;
    }
}
``

## CreateQuizExamDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record CreateQuizExamDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        public int PassPercentage { get; init; } = 75;

        [MinLength(1)]
        public List<CreateQuizQuestionDto> Questions { get; init; } = [];
    }
}
``

## CreateQuizOptionDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record CreateQuizOptionDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        public string Text { get; init; } = string.Empty;

        public bool IsCorrect { get; init; }
    }
}
``

## CreateQuizQuestionDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record CreateQuizQuestionDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        public string Prompt { get; init; } = string.Empty;

        [MinLength(2)]
        public List<CreateQuizOptionDto> Options { get; init; } = [];
    }
}
``

## PraticalDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record PracticalDto
    {
        public int LessonId { get; init; }
        public string Title { get; init; } = string.Empty;

        // cÃ¡i FE cáº§n Ä‘á»ƒ render UI
        public IReadOnlyList<PracticalNoteDto> ExpectedNotes { get; init; } = [];
        public string? SheetMusicJson { get; init; }
    }
    public sealed record PracticalNoteDto
    {
        public int SortOrder { get; init; }
        public string Note { get; init; } = string.Empty;

        // optional: giÃºp FE UI Ä‘áº¹p hÆ¡n
        public string? Hint { get; init; }
    }

    public sealed record UpdateSheetMusicRequestDto
    {
        public string SheetMusicJson { get; init; } = string.Empty;
    }
}
``

## QuizDetailDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRhythm.Application.Contracts.Courses;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record QuizQuestionDetailDto
    {
        public int Id { get; init; }
        public int SortOrder { get; init; }

        public string Prompt { get; init; } = string.Empty;

        public List<QuizOptionDetailDto> Options { get; init; } = [];
    }
    public sealed record QuizOptionDetailDto
    {
        public int Id { get; init;  }
        public int SortOrder { get; init; }

        public string Text { get; init; } = string.Empty;

        public bool IsCorrect { get; init; }
    }
    public sealed record PracticalLessonDetailDto
    {
        public string Title { get; init; } = string.Empty;
        public string? SheetMusicJson { get; init; }

        public List<PracticalNoteDetailDto> Notes { get; init; } = [];
    }
    public sealed record PracticalNoteDetailDto
    {
        public int SortOrder { get; init; }

        public string Note { get; init; } = string.Empty;
    }
    public sealed record QuizDto
    {
        public int Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public int PassPercentage { get; init; }
        public IReadOnlyList<QuizQuestionDto> Questions { get; init; } = [];
    }
}
``

## SubmitPraticalRequestDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{

    public sealed record SubmitPracticalRequestDto
    {
        public IReadOnlyList<string> Notes { get; init; } = [];

        public IReadOnlyList<int>? TimingsMs { get; init; }
    }
    public sealed record SubmitPracticalResponseDto
    {
        // số note đúng vị trí
        public int CorrectNotes { get; init; }

        // tổng expected notes
        public int TotalNotes { get; init; }

        // % điểm
        public decimal ScorePercentage { get; init; }

        // pass/fail
        public bool Passed { get; init; }

        // optional UX enhancement
        public IReadOnlyList<NoteCheckResultDto> Results { get; init; } = [];
    }
    public sealed record NoteCheckResultDto
    {
        public int SortOrder { get; init; }

        public string Expected { get; init; } = string.Empty;

        public string Actual { get; init; } = string.Empty;

        public bool IsCorrect { get; init; }
    }
}
``

## SubmitQuizRequestDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRhythm.Application.Contracts.Exams;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record SubmitQuizRequestDto
    {
        public required List<QuizAnswerDto> Answers { get; init; }
    }
}
``

## SubmitQuizResponseDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record SubmitQuizResponseDto
    {
        public int CorrectAnswers { get; init; }

        public int TotalQuestions { get; init; }

        public decimal ScorePercentage { get; init; }

        public bool Passed { get; init; }
    }
}
``

## TheoryDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record TheoryDto
    {
        public int LessonId { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Content { get; init; } = string.Empty;
    }
}
``

## UpdatePraticalExamDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record UpdatePracticalExamRequestDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        [MinLength(1)]
        public List<UpdatePracticalNoteRequestDto> Notes { get; init; } = [];
    }
}
``

## UpdatePraticalNoteDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record UpdatePracticalNoteRequestDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        [MaxLength(50)]
        public string Note { get; init; } = string.Empty;
    }
}
``

## UpdateQuizExamDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record UpdateQuizExamRequestDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; init; } = string.Empty;

        [MinLength(1)]
        public List<UpdateQuizQuestionRequestDto> Questions { get; init; } = [];
    }
}
``

## UpdateQuizOptionDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record UpdateQuizOptionRequestDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        [MaxLength(500)]
        public string Text { get; init; } = string.Empty;

        public bool IsCorrect { get; init; }
    }
}
``

## UpdateQuizQuestionDto.cs

``csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRhythm.Application.Contracts.QuizExams
{
    public sealed record UpdateQuizQuestionRequestDto
    {
        [Required]
        public int SortOrder { get; init; }

        [Required]
        [MaxLength(1000)]
        public string Prompt { get; init; } = string.Empty;

        [MinLength(2)]
        public List<UpdateQuizOptionRequestDto> Options { get; init; } = [];
    }
}
``

