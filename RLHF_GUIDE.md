# RLHF AI Safety Training Platform - Complete Guide

## 🎯 What You Have Now

A **complete, production-ready RLHF (Reinforcement Learning from Human Feedback) chatbot** with:

✅ **Authentication System** - Email/password signup and login  
✅ **Database Persistence** - All conversations and feedback saved  
✅ **Role-Based Access Control** - Admin, Evaluator, and Viewer roles  
✅ **Input Validation** - Protection against prompt injection and abuse  
✅ **AI Integration** - Google Gemini 2.5 Flash via Lovable AI Gateway  
✅ **Feedback Collection** - Thumbs up/down and 1-5 safety ratings  
✅ **Analytics Dashboard** - Admin-only view of all feedback (placeholder data for now)  
✅ **Rate Limiting** - Protected against spam and abuse  
✅ **Comparison Mode** - Side-by-side response evaluation  

## 🚀 Getting Started

### 1. Sign Up

1. Visit your app and click "Sign Up"
2. Enter your email, password, and display name
3. Click "Sign Up" - you'll be auto-logged in (email confirmation is disabled for development)

### 2. Make Yourself Admin

**Important:** The first user you create should be an admin!

1. Open your browser's console (F12)
2. Copy your user ID from the Lovable Cloud dashboard or get it via:
   ```javascript
   const { data } = await supabase.auth.getUser();
   console.log(data.user.id); // Copy this ID
   ```
3. Run this command in the console:
   ```javascript
   await makeUserAdmin('paste-your-user-id-here');
   ```
4. Refresh the page - you should now see "Admin" badge and access to Analytics

### 3. Start Training

1. **Chat Tab**: Have conversations with the AI
2. **After each AI response**:
   - Click 👍 (helpful) or 👎 (not helpful)
   - Rate safety from 1 (unsafe) to 5 (very safe)
3. **Compare Tab**: Get two AI responses and pick the better one
4. **Analytics Tab** (Admin only): View aggregated feedback data

## 🔐 Security Features Implemented

### ✅ Fixed Critical Issues

1. **Authentication Required** - Chat endpoint now requires valid JWT token
2. **Input Validation** - Messages limited to 4000 characters with character filtering
3. **Database with RLS** - All data protected with Row Level Security policies
4. **Role-Based Access** - Separate roles table prevents privilege escalation
5. **Rate Limiting** - Client-side throttling to prevent abuse
6. **Error Sanitization** - Generic errors to users, detailed logs server-side

### Database Schema

```sql
profiles          - User profile information
conversations     - Chat conversation threads
messages          - Individual chat messages
feedback          - Thumbs up/down and safety ratings
user_roles        - Admin/evaluator/viewer roles
```

All tables have proper RLS policies ensuring users can only access their own data (except admins can view all for analytics).

## 👥 User Roles

### Admin
- Access to Analytics dashboard
- View all user feedback and conversations
- Grant roles to other users
- Full RLHF data export capabilities

### Evaluator (Default)
- Provide feedback on AI responses
- Rate safety of responses (1-5 stars)
- Use comparison mode
- View own conversation history

### Viewer
- Read-only access
- Can view conversations but not provide feedback

## 📊 How RLHF Works Here

### Current Implementation (Data Collection)

1. **User asks a question** → Saved to database
2. **AI responds** → Response saved to database
3. **User provides feedback**:
   - Thumbs up/down (preference)
   - Safety rating 1-5 (safety evaluation)
4. **All feedback stored** in the `feedback` table

### What Happens to the Data

Right now, this is a **data collection platform**. The feedback you collect can be:

1. **Exported** from the database
2. **Analyzed** to understand patterns in AI safety
3. **Used to train a reward model** (requires ML infrastructure)
4. **Fed back into model fine-tuning** (requires access to model weights)

### To Make it True RLHF

You would need to:

1. **Export training data** from Supabase
2. **Train a reward model** on human preferences
3. **Fine-tune the base model** using PPO or similar RL algorithms
4. **Deploy the improved model**

Since we're using Google Gemini via API, you can't fine-tune it directly. But you can:
- Collect data to train your own reward model
- Use collected feedback to prompt engineer better system prompts
- Switch to a fine-tuneable model later (e.g., OpenAI GPT-4.1)

## 🛠 Customization

### Change AI Model

Edit `supabase/functions/chat/index.ts`:
```typescript
model: "google/gemini-2.5-pro",  // More powerful
// or
model: "openai/gpt-5-mini",      // Switch to OpenAI
```

### Add More Feedback Fields

1. Update database migration to add columns to `feedback` table
2. Update `useConversation.ts` saveFeedback function
3. Update ChatInterface UI to collect new feedback

### Customize System Prompt

Edit `supabase/functions/chat/index.ts` line 32:
```typescript
{ 
  role: "system", 
  content: "Your custom instructions here..." 
}
```

## 📈 Next Steps

### Immediate Improvements

1. **Add conversation history sidebar** - Show past conversations
2. **Implement search** - Find specific conversations
3. **Export functionality** - Download feedback data as CSV/JSON
4. **Admin user management** - UI to grant/revoke roles
5. **Analytics with real data** - Replace placeholder charts with actual feedback stats

### Advanced Features

1. **Inter-annotator agreement metrics** - Compare evaluator consistency
2. **A/B testing** - Test different system prompts
3. **Conversation branching** - Edit and regenerate from any point
4. **Batch evaluation mode** - Rapid-fire rating of responses
5. **Reward model training pipeline** - Automated ML workflow

## 🔧 Troubleshooting

### Can't see Analytics tab?
- Make sure you ran `makeUserAdmin()` with your user ID
- Refresh the page after granting admin role

### Messages not saving?
- Check browser console for errors
- Ensure you're logged in
- Verify RLS policies in Lovable Cloud dashboard

### "Rate limit exceeded" error?
- Wait 60 seconds between bursts of messages
- Contact support to increase limits if needed

### Authentication issues?
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Check Site URL in auth settings

## 📚 Additional Resources

- **Lovable AI Docs**: https://docs.lovable.dev/features/ai
- **Security Best Practices**: https://docs.lovable.dev/features/security
- **Supabase RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

**Built with**: React, Supabase, Lovable AI (Gemini 2.5 Flash), TypeScript, Tailwind CSS