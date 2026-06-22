-- Open 3rd and 4th year so students can reach each subject. Subjects with no
-- modules show an inline "coming soon" waitlist form (SubjectComingSoon).
update years set coming_soon = false where label in ('3rd Year', '4th Year');
