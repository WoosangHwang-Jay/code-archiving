# Design Doc: Project Rebranding (GitHub & Firebase)

## Goal
Rename the project's external links and internal configurations to align with the new names: `pjt_jaydosa` (GitHub) and `pjt-jaydosa` (Firebase).

## Proposed Changes

### GitHub Remote
- Update the Git remote URL for `origin`.
- Target URL: `https://github.com/WoosangHwang-Jay/pjt_jaydosa.git`

### Firebase Configuration
- Update `.firebaserc` to point to the new project ID `pjt-jaydosa`.
- Verify the connection using Firebase CLI.

### Project Metadata
- Update `package.json` name field to `pjt_jaydosa`.

## Verification Plan
1. Run `git remote -v` to check the URL.
2. Run `npx firebase use` to check the active project.
3. Check `package.json` and `.firebaserc` contents.
