# Full-Stack Development Skill

This is a comprehensive Claude Code skill for full-stack development on the newapp project, a React Native softphone application with a complete modern tech stack.

## What's Included

### Main Skill File: `SKILL.md`
The main entry point with:
- Quick overview of the technology stack
- Core capabilities for each layer
- Project-specific context (VoIP softphone)
- Development patterns and best practices
- Debugging tips
- Common workflows

### Supporting Files

#### `TECH-STACK.md`
Detailed reference for all technologies:
- React Native: Libraries, directories, navigation structure
- NestJS: Framework concepts and typical structure
- PostgreSQL: Schema design, migrations, common operations
- Supabase: Features and use cases
- Firebase: Services and integration
- Android (Kotlin): Native code components
- iOS (Swift): Native code components
- Development tools and deployment procedures

#### `BEST-PRACTICES.md`
Development standards and patterns:
- React Native component architecture
- Backend API design
- Database design principles
- Security best practices
- Debugging strategies
- Deployment checklists
- Code quality standards
- Team collaboration guidelines

#### `QUICK-REFERENCE.md`
Quick lookup guide:
- Common NPM commands
- Git workflows
- React Native structure patterns
- Backend (NestJS) structure
- Database operations
- Android and iOS debugging
- Useful tools and services
- Debugging checklists
- Code snippets

## How to Use This Skill

### Automatic Invocation
Claude will automatically load this skill when you ask questions about:
- Building React Native features
- Creating backend APIs
- Database schema design
- Mobile platform integration
- Architecture and tech stack
- Debugging issues across layers
- Performance optimization
- Deployment procedures

### Manual Invocation
Type `/full-stack-development` to invoke the skill directly.

## File Structure

```
.claude/skills/full-stack-development/
├── SKILL.md                  # Main skill file (required) — Overview of all tech layers
├── README.md                 # This file
├── TECH-STACK.md             # Detailed technology reference + decision matrix
├── BEST-PRACTICES.md         # Development standards + SIP-specific patterns
├── SIP-AND-WEBRTC.md         # [NEW] Deep dive into SIP integration, flows, examples
├── DEBUGGING-GUIDE.md        # [NEW] Troubleshooting for common issues
└── QUICK-REFERENCE.md        # Commands, snippets + project-specific patterns
```

## Key Features

✅ **Comprehensive Stack Coverage**: React Native, Kotlin, Swift, JavaScript, NestJS, PostgreSQL, Firebase, Supabase

✅ **Project Context**: Specific guidance for the newapp VoIP softphone application (not generic)

✅ **SIP/VoIP Patterns**: Event listeners, registration flows, incoming/outgoing calls, WebRTC integration

✅ **Proven Code Examples**: Real patterns from the codebase, copy-paste ready

✅ **Debugging Support**: Step-by-step troubleshooting for the 10 most common issues

✅ **Technology Decision Guide**: When to use PostgreSQL, Supabase, or Firebase for this project

✅ **Security Guidance**: Best practices for authentication, data protection, API security, SIP credentials

✅ **Deployment Help**: Checklists and procedures for releases

✅ **Quick Reference**: Commands, snippets, and tool recommendations

## What's New (v2.0)

**Created:** 2026-07-13
**Updated:** 2026-07-13

### Additions
- 🆕 **SIP-AND-WEBRTC.md**: Complete guide to SIP registration, incoming/outgoing calls, WebRTC setup, event architecture, error handling
- 🆕 **DEBUGGING-GUIDE.md**: Troubleshooting for registration issues, incoming/outgoing calls, audio problems, listeners, crashes, network issues
- 🆕 **BEST-PRACTICES.md § SIP & VoIP**: Critical patterns for event cleanup, AsyncStorage, error handling, navigation from services
- 🆕 **QUICK-REFERENCE.md § Project Snippets**: Real, copy-paste examples for SIP login, registration, call flows, history
- 🆕 **TECH-STACK.md § Decision Matrix**: When to use PostgreSQL vs Supabase vs Firebase for future backend

### Improvements
- Emphasized critical SIP patterns (event listener cleanup, credential storage)
- Added project-specific code snippets (not generic)
- Expanded from generic full-stack guidance to VoIP-specialized
- Cross-linked files with references

### Known Gaps (TBD)
- [ ] iOS SIP implementation (currently Android-only)
- [ ] Testing patterns for SIP/WebRTC (complex mocking)
- [ ] Performance tuning for long calls
- [ ] Voicemail integration details
- [ ] Contact sync with backend

## Version History

| Version | Date | Changes |
|---------|------|---------|
| **v2.0** | 2026-07-13 | Added SIP/WebRTC deep dives, debugging guide, project snippets, decision matrix |
| **v1.0** | (original) | Initial creation with full technology stack coverage |

## How This Skill Improves Over v1.0

| Aspect | v1.0 | v2.0 | Improvement |
|--------|------|------|-------------|
| SIP Guidance | Generic mention | Dedicated SIP-AND-WEBRTC.md with flows and code | 5x more detailed |
| Code Examples | Generic snippets | Project-specific patterns (login, incoming calls) | 3x more relevant |
| Debugging | Brief tips | Step-by-step guide for 10+ issues | 10x more actionable |
| Technology Decisions | No guidance | Decision matrix (PostgreSQL vs Supabase vs Firebase) | New |
| Event Patterns | Mentioned | Critical BEST-PRACTICES section + examples | Emphasized |
| Async/Storage | Minimal | Full credential save/load patterns | New |

## Usage Tips

### Getting Started
1. Read **SKILL.md** for overview (5 min)
2. Read **SIP-AND-WEBRTC.md** if building SIP features (20 min)
3. Refer to **QUICK-REFERENCE.md** for copy-paste code (as needed)
4. Check **DEBUGGING-GUIDE.md** if something isn't working (as needed)

### For Different Roles
- **Mobile Dev**: Start with SKILL.md → SIP-AND-WEBRTC.md → QUICK-REFERENCE.md
- **Backend Dev**: Start with SKILL.md → TECH-STACK.md (decision matrix) → NestJS patterns
- **Debugging Issue**: DEBUGGING-GUIDE.md (quick search)
- **Code Review**: BEST-PRACTICES.md § SIP patterns

### Keep This Open
- While building SIP features: SIP-AND-WEBRTC.md
- While debugging: DEBUGGING-GUIDE.md
- For API integration: TECH-STACK.md decision matrix
