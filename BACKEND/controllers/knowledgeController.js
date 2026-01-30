const KnowledgeBase = require('../models/KnowledgeBase');
const FAQ = require('../models/FAQ');

// Get all knowledge articles
exports.getAllKnowledge = async (req, res) => {
  try {
    const { category, sunlight, season, difficulty, search } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (sunlight) query.sunlight = sunlight;
    if (season) query.season = season;
    if (difficulty) query.difficulty = difficulty;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const knowledge = await KnowledgeBase.find(query)
      .populate('author', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: knowledge.length,
      knowledge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single knowledge article
exports.getKnowledge = async (req, res) => {
  try {
    const knowledge = await KnowledgeBase.findById(req.params.id)
      .populate('author', 'name profileImage');

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge article not found'
      });
    }

    // Increment view count
    knowledge.views += 1;
    await knowledge.save();

    res.status(200).json({
      success: true,
      knowledge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create knowledge article (admin only)
exports.createKnowledge = async (req, res) => {
  try {
    if (req.userRole !== 'platform_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only platform admins can create knowledge articles'
      });
    }

    const { 
      title, 
      content, 
      category, 
      tags, 
      plantTypes, 
      sunlight, 
      season, 
      difficulty 
    } = req.body;

    const knowledge = await KnowledgeBase.create({
      title,
      content,
      category,
      tags: tags ? tags.split(',') : [],
      plantTypes: plantTypes ? plantTypes.split(',') : [],
      sunlight,
      season,
      difficulty,
      author: req.userId
    });

    res.status(201).json({
      success: true,
      knowledge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update knowledge article
exports.updateKnowledge = async (req, res) => {
  try {
    if (req.userRole !== 'platform_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only platform admins can update knowledge articles'
      });
    }

    const updates = req.body;
    
    if (updates.tags) {
      updates.tags = updates.tags.split(',');
    }
    
    if (updates.plantTypes) {
      updates.plantTypes = updates.plantTypes.split(',');
    }

    updates.updatedAt = Date.now();

    const knowledge = await KnowledgeBase.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge article not found'
      });
    }

    res.status(200).json({
      success: true,
      knowledge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search FAQs
exports.searchFAQ = async (req, res) => {
  try {
    const { query, category } = req.query;
    
    let searchQuery = {};
    
    if (query) {
      searchQuery.$or = [
        { question: { $regex: query, $options: 'i' } },
        { answer: { $regex: query, $options: 'i' } },
        { keywords: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (category) {
      searchQuery.category = category;
    }

    const faqs = await FAQ.find(searchQuery).sort({ helpfulCount: -1 });

    // If no results found, try to find similar keywords
    if (faqs.length === 0 && query) {
      const words = query.toLowerCase().split(' ');
      const similarFAQs = await FAQ.find({
        $or: words.map(word => ({
          $or: [
            { question: { $regex: word, $options: 'i' } },
            { answer: { $regex: word, $options: 'i' } }
          ]
        }))
      }).limit(5);
      
      return res.status(200).json({
        success: true,
        count: similarFAQs.length,
        faqs: similarFAQs,
        message: similarFAQs.length > 0 ? 'Found similar results' : 'No results found'
      });
    }

    res.status(200).json({
      success: true,
      count: faqs.length,
      faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Rate FAQ helpfulness
exports.rateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body; // true for helpful, false for not helpful

    const faq = await FAQ.findById(id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    if (helpful) {
      faq.helpfulCount += 1;
    } else {
      faq.notHelpfulCount += 1;
    }

    await faq.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get plant selection guidance
exports.getPlantGuidance = async (req, res) => {
  try {
    const { sunlight, terraceSize, climate, experience } = req.query;
    
    let query = {};
    
    if (sunlight) query.sunlight = sunlight;
    if (climate) query.tags = { $in: [climate] };
    
    if (experience === 'beginner') {
      query.difficulty = 'easy';
    } else if (experience === 'intermediate') {
      query.difficulty = { $in: ['easy', 'medium'] };
    }

    // Filter by terrace size
    let sizeFilter = {};
    if (terraceSize === 'small') {
      sizeFilter.tags = { $in: ['container', 'small-space', 'compact'] };
    } else if (terraceSize === 'medium') {
      sizeFilter.tags = { $in: ['medium-space', 'container'] };
    } else if (terraceSize === 'large') {
      sizeFilter.tags = { $in: ['large-space', 'spreading'] };
    }

    const knowledge = await KnowledgeBase.find({ ...query, ...sizeFilter })
      .select('title category plantTypes sunlight difficulty tags')
      .limit(20);

    // Group by plant type
    const plantSuggestions = {};
    knowledge.forEach(article => {
      article.plantTypes.forEach(plantType => {
        if (!plantSuggestions[plantType]) {
          plantSuggestions[plantType] = {
            count: 0,
            articles: [],
            suitableFor: []
          };
        }
        
        plantSuggestions[plantType].count += 1;
        plantSuggestions[plantType].articles.push({
          id: article._id,
          title: article.title,
          difficulty: article.difficulty
        });
        
        if (article.tags) {
          article.tags.forEach(tag => {
            if (!plantSuggestions[plantType].suitableFor.includes(tag)) {
              plantSuggestions[plantType].suitableFor.push(tag);
            }
          });
        }
      });
    });

    // Convert to array and sort
    const suggestions = Object.entries(plantSuggestions)
      .map(([plantType, data]) => ({
        plantType,
        ...data
      }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      suggestions,
      filters: { sunlight, terraceSize, climate, experience }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get seasonal gardening tips
exports.getSeasonalTips = async (req, res) => {
  try {
    const { season } = req.query;
    const currentSeason = season || getCurrentSeason();
    
    const tips = await KnowledgeBase.find({
      season: { $in: [currentSeason, 'all'] },
      category: 'beginner'
    })
    .select('title content tags plantTypes')
    .sort({ difficulty: 1 })
    .limit(10);

    res.status(200).json({
      success: true,
      season: currentSeason,
      tips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to get current season
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 10) return 'monsoon';
  return 'winter';
}