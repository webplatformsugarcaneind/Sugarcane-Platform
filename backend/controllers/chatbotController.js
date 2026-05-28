const ChatMessage = require('../models/chatMessage.model');
const User = require('../models/user.model');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Build system prompt based on user role
const buildSystemPrompt = (userRole, context) => {
  const basePrompt = `You are a helpful AI assistant for the CaneSetu sugarcane platform. Be concise, helpful, and accurate.`;

  const rolePrompts = {
    'Farmer': `You are helping a Farmer named ${context?.profile?.name || 'User'}. Help them with:
- Crop management and harvesting practices
- Market information for sugarcane
- Contract negotiation advice  
- Marketplace navigation
- Government schemes and subsidies
- Weather and seasonal information
Be practical and field-focused. Keep responses concise.`,

    'HHM': `You are helping a Harvest Manager (HHM) named ${context?.profile?.name || 'User'}. Help them with:
- Worker recruitment and management
- Schedule optimization
- Quality control procedures
- Factory coordination
- Contract negotiation tips
- Performance analytics interpretation
Provide strategic operational advice.`,

    'Worker': `You are helping a Worker named ${context?.profile?.name || 'User'}. Help them with:
- Finding suitable job opportunities
- Application process and status tracking
- Skill development suggestions
- Wage information and payment tracking
- Dispute resolution
Be supportive and encouraging.`,

    'Factory': `You are helping a Factory representative named ${context?.profile?.name || 'User'}. Help them with:
- HHM recruitment and partnership
- Quality standards and specifications
- Bill reconciliation and payment
- Maintenance scheduling
- Analytics interpretation
- Supply chain optimization
Provide technical and operational guidance.`,

    'Public': `You are helping a visitor to the CaneSetu platform. Help them with:
- Platform overview and features
- Registration process
- Role descriptions
- How the platform works
- Benefits for each user type
- Getting started guide
Be welcoming and informative.`
  };

  const roleSpecific = rolePrompts[userRole] || rolePrompts['Public'];
  
  return `${basePrompt}\n\n${roleSpecific}\n\nIMPORTANT GUIDELINES:\n- Be respectful and helpful\n- Provide practical advice\n- If unsure, suggest contacting support\n- Never make false claims about platform features\n- Keep responses under 150 words\n- Use simple, clear language\n- Consider local context (agriculture, Indian market)`;
};

/**
 * Send message to chatbot
 * @route   POST /api/chatbot/send-message
 * @access  Public (homepage) or Private (authenticated)
 */
const sendMessage = async (req, res) => {
  try {
    const { message, context, sessionId, isPublic } = req.body;
    const user = req.user;

    console.log('sendMessage called — message length:', (message || '').length, 'sessionId:', sessionId, 'isPublic:', isPublic);

    // Validation
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    // Determine user role
    let userRole = 'Public';
    let userId = null;

    if (!isPublic && user) {
      userRole = user.role || 'Public';
      userId = user._id;
    }

    console.log(`📝 Chat message from ${userRole}:`, message.substring(0, 50) + '...');

    // Build system prompt
    const systemPrompt = buildSystemPrompt(userRole, context);

    // Get AI response
    let response;
    try {
      response = await getAIResponse(message, systemPrompt);
    } catch (aiError) {
      console.error('AI API error:', aiError.message);
      response = getFallbackResponse(message);
    }

    // Save to database (if user is authenticated)
    if (userId && !isPublic) {
      try {
        const chatMessage = new ChatMessage({
          userId,
          sessionId,
          role: 'user',
          userRole,
          content: message,
          context: {
            profile: context?.user,
            isPublic: false
          }
        });

        const assistantMessage = new ChatMessage({
          userId,
          sessionId,
          role: 'assistant',
          userRole,
          content: response.content,
          metadata: {
            tokens: response.tokens,
            model: response.model
          }
        });

        await Promise.all([
          chatMessage.save(),
          assistantMessage.save()
        ]);
      } catch (dbError) {
        console.error('Database save error:', dbError);
      }
    }

    console.log('Assistant response ->', response);
    res.status(200).json({
      success: true,
      response: response.content,
      tokens: response.tokens,
      model: response.model,
      sessionId
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Error processing chat message', error: error.message });
  }
};

/**
 * Get chat history
 * @route   GET /api/chatbot/history/:sessionId
 * @access  Private
 */
const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    if (!sessionId) return res.status(400).json({ success: false, message: 'Session ID is required' });

    const messages = await ChatMessage.find({ sessionId, userId: user._id }).sort({ createdAt: 1 }).limit(100);

    res.status(200).json({ success: true, messages, count: messages.length });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, message: 'Error fetching chat history' });
  }
};

/**
 * Submit feedback on a message
 * @route   POST /api/chatbot/feedback
 * @access  Private
 */
const submitFeedback = async (req, res) => {
  try {
    const { messageId, rating } = req.body;

    if (!messageId || rating === undefined) return res.status(400).json({ success: false, message: 'Message ID and rating are required' });

    const message = await ChatMessage.findByIdAndUpdate(messageId, { $set: { 'feedback.rating': rating === 1 ? 1 : 0 } }, { new: true });

    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    res.status(200).json({ success: true, message: 'Feedback submitted' });

  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ success: false, message: 'Error submitting feedback' });
  }
};

/**
 * Clear chat session
 * @route   DELETE /api/chatbot/sessions/:sessionId
 * @access  Private
 */
const clearSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    if (!sessionId) return res.status(400).json({ success: false, message: 'Session ID is required' });

    await ChatMessage.deleteMany({ sessionId, userId: user._id });

    res.status(200).json({ success: true, message: 'Session cleared' });

  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({ success: false, message: 'Error clearing session' });
  }
};

/**
 * Get AI response using Gemini (Generative Language API)
 */
const getAIResponse = async (userMessage, systemPrompt) => {
  try {
    const googleKey = process.env.GOOGLE_API_KEY;
    const googleModel = process.env.GOOGLE_MODEL || 'gemini-3.5-flash';

    if (!googleKey) {
      console.warn('No GOOGLE_API_KEY configured — returning local fallback response');
      return getFallbackResponse(userMessage);
    }

    const detailedInstructionText = 'Please answer thoroughly and with actionable details; when relevant, reference project files included in context and provide examples or steps.';
    const promptText = `${detailedInstructionText}\n\n${systemPrompt}\n\nUser: ${userMessage}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent?key=${googleKey}`;

    // Include project files as additional context so Gemini can answer project-specific questions
    const includeProjectContext = true; // enabled so the model has repository context
    const contents = [];

    if (includeProjectContext) {
      const filesToInclude = [
        path.resolve(__dirname, '..', '..', 'README.md'),
        path.resolve(__dirname, '..', 'README_GEMINI.md'),
        path.resolve(__dirname, '..', 'routes', 'chatbot.routes.js'),
        path.resolve(__dirname, '..', 'controllers', 'chatbotController.js'),
        path.resolve(__dirname, '..', '..', 'frontend', 'src', 'services', 'chatbotService.js')
      ];

      for (const fp of filesToInclude) {
        try {
          if (fs.existsSync(fp)) {
            let txt = fs.readFileSync(fp, 'utf8');
            // Trim very large files to a safe size for prompt (approx 4000 chars)
            if (txt.length > 4000) txt = txt.slice(0, 4000) + '\n...[truncated]';
            contents.push({ parts: [{ text: `File: ${path.relative(path.resolve(__dirname, '..', '..'), fp)}\n\n${txt}` }], role: 'user' });
          }
        } catch (e) {
          // ignore file read errors
        }
      }
    }

    // Finally append the user prompt as the last content
    contents.push({ parts: [{ text: promptText }], role: 'user' });

    const payload = {
      contents,
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.7,
        candidateCount: 1
      }
    };

    const gResp = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });

    let content = null;
    if (gResp.data && Array.isArray(gResp.data.candidates) && gResp.data.candidates.length > 0) {
      const cand = gResp.data.candidates[0];
      if (cand && cand.content && Array.isArray(cand.content.parts)) {
        content = cand.content.parts.map(p => p.text || '').join('\n').trim();
      }
      if (!content && cand && cand.text) content = cand.text;
    }

    return {
      content: content || 'Sorry, I could not generate a response.',
      tokens: gResp.data && gResp.data.usageMetadata ? (gResp.data.usageMetadata.totalTokenCount || null) : null,
      model: googleModel
    };

  } catch (error) {
    const errorDetails = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
    console.error('Gemini API error:', errorDetails);
    fs.writeFileSync('gemini_error.txt', errorDetails);
    return getFallbackResponse(userMessage);
  }
};

/**
 * Fallback responses for when AI API is unavailable
 */
const getFallbackResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();

  const responses = {
    'hello': 'Hello! How can I assist you with CaneSetu today?',
    'help': 'I can help you with information about the platform, roles, features, and how to get started. What would you like to know?',
    'farmer': 'For Farmers: You can manage harvest requests, track progress, access the marketplace, and connect with HHMs. What else?',
    'hhm': 'For HHM (Harvest Managers): Coordinate between farmers and factories, manage workers, and optimize operations. Questions?',
    'worker': 'For Workers: Browse jobs, apply to opportunities, track your work schedule, and manage wages. How can I help?',
    'factory': 'For Factories: Manage contracts with HHMs, post updates, track supply, and optimize crushing operations. Need more info?',
    'default': 'I\'d be happy to help! Could you provide more details about what you need assistance with?'
  };

  let response = responses['default'];
  for (const [key, value] of Object.entries(responses)) {
    if (key !== 'default' && lowerMessage.includes(key)) { response = value; break; }
  }

  return { content: response, tokens: response.split(' ').length, model: 'fallback' };
};

module.exports = { sendMessage, getHistory, submitFeedback, clearSession };
