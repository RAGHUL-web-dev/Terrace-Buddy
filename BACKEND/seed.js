const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Community = require('./models/Community');
const Channel = require('./models/Channel');
const Message = require('./models/Message');
const MarketplaceItem = require('./models/MarketplaceItem');
const KnowledgeBase = require('./models/KnowledgeBase');
const FAQ = require('./models/FAQ');
const Plant = require('./models/Plant');
const Notification = require('./models/Notification');

const connectDB = require('./config/database');

// Connect to database
connectDB();

// Plant image URLs (using placeholder images)
const PLANT_IMAGES = [
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1505801223264-8949dc7815e9?w-400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1566566716926-1d1ac4e0d1e1?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop"
];

const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Community.deleteMany({});
        await Channel.deleteMany({});
        await Message.deleteMany({});
        await MarketplaceItem.deleteMany({});
        await KnowledgeBase.deleteMany({});
        await FAQ.deleteMany({});
        await Plant.deleteMany({});
        await Notification.deleteMany({});

        console.log('🗑️  Cleared existing data');

        // Create admin user
        const adminPassword = await bcrypt.hash('Admin@123', 12);
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@terracebuddy.com',
            password: adminPassword,
            gardeningLevel: 'advanced',
            role: 'platform_admin',
            location: {
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India'
            },
            profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
        });

        // Create regular users
        const users = [];
        const userData = [
            {
                name: 'Rajesh Kumar',
                email: 'rajesh@example.com',
                password: await bcrypt.hash('User@123', 12),
                gardeningLevel: 'beginner',
                location: { 
                    city: 'Delhi', 
                    state: 'Delhi', 
                    country: 'India' 
                },
                profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
            },
            {
                name: 'Priya Sharma',
                email: 'priya@example.com',
                password: await bcrypt.hash('User@123', 12),
                gardeningLevel: 'intermediate',
                location: { 
                    city: 'Bangalore', 
                    state: 'Karnataka', 
                    country: 'India' 
                },
                profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop'
            },
            {
                name: 'Amit Patel',
                email: 'amit@example.com',
                password: await bcrypt.hash('User@123', 12),
                gardeningLevel: 'intermediate',
                location: { 
                    city: 'Ahmedabad', 
                    state: 'Gujarat', 
                    country: 'India' 
                },
                profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'
            },
            {
                name: 'Sneha Reddy',
                email: 'sneha@example.com',
                password: await bcrypt.hash('User@123', 12),
                gardeningLevel: 'advanced',
                location: { 
                    city: 'Hyderabad', 
                    state: 'Telangana', 
                    country: 'India' 
                },
                profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'
            }
        ];

        for (const data of userData) {
            const user = await User.create(data);
            users.push(user);
        }

        console.log(`👥 Created ${users.length + 1} users`);

        // Create default community
        const defaultCommunity = await Community.create({
            name: 'Terrace Gardeners United',
            description: 'The main community for all terrace gardening enthusiasts. Share tips, ask questions, and connect with fellow gardeners.',
            admin: adminUser._id,
            visibility: 'public',
            category: 'general',
            members: [adminUser._id, ...users.map(u => u._id)],
            rules: [
                'Be respectful to all members',
                'No spam or self-promotion',
                'Share only gardening-related content',
                'Help beginners when possible'
            ],
            bannerImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=400&fit=crop'
        });

        // Create channels for default community
        const channels = await Channel.create([
            {
                name: 'welcome',
                description: 'Introduce yourself to the community',
                community: defaultCommunity._id,
                createdBy: adminUser._id,
                type: 'general'
            },
            {
                name: 'general',
                description: 'General gardening discussions',
                community: defaultCommunity._id,
                createdBy: adminUser._id,
                type: 'general'
            },
            {
                name: 'help-desk',
                description: 'Get help with gardening problems',
                community: defaultCommunity._id,
                createdBy: adminUser._id,
                type: 'help'
            },
            {
                name: 'success-stories',
                description: 'Share your gardening success stories',
                community: defaultCommunity._id,
                createdBy: adminUser._id,
                type: 'announcements'
            }
        ]);

        defaultCommunity.channels = channels.map(c => c._id);
        await defaultCommunity.save();

        // Update users with joined community
        await User.updateMany(
            { _id: { $in: users.map(u => u._id) } },
            { $push: { joinedCommunities: defaultCommunity._id } }
        );

        // Create sample messages
        const messages = await Message.create([
            {
                community: defaultCommunity._id,
                channel: channels[0]._id, // welcome channel
                sender: adminUser._id,
                content: 'Welcome to Terrace Gardeners United! Feel free to introduce yourself and share your gardening journey.',
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            },
            {
                community: defaultCommunity._id,
                channel: channels[0]._id,
                sender: users[0]._id,
                content: 'Hi everyone! I\'m Rajesh from Delhi. Just started terrace gardening 2 months ago. Currently growing tomatoes and mint.',
                timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
            },
            {
                community: defaultCommunity._id,
                channel: channels[1]._id, // general channel
                sender: users[1]._id,
                content: 'Has anyone tried growing strawberries on their terrace? I need some tips.',
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
                community: defaultCommunity._id,
                channel: channels[1]._id,
                sender: users[2]._id,
                content: 'I grow strawberries! They need well-draining soil and at least 6 hours of sunlight. Make sure to water regularly but don\'t overwater.',
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1000 * 60 * 30) // 5 days ago + 30 mins
            },
            {
                community: defaultCommunity._id,
                channel: channels[2]._id, // help-desk
                sender: users[3]._id,
                content: 'My tomato plant leaves are turning yellow. Any suggestions?',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            },
            {
                community: defaultCommunity._id,
                channel: channels[2]._id,
                sender: adminUser._id,
                content: 'Yellow leaves on tomatoes can be due to overwatering or nutrient deficiency. Check if the soil is too wet and consider adding some compost.',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1000 * 60 * 15) // 3 days ago + 15 mins
            }
        ]);

        console.log(`💬 Created ${messages.length} sample messages`);

        // Create FAQ data
        const faqs = await FAQ.create([
            {
                question: 'How often should I water my terrace plants?',
                answer: 'Watering frequency depends on plant type, season, and weather. Generally, water when the top 1-2 inches of soil feels dry. Succulents need less water (every 2-3 weeks), while vegetables may need daily watering in summer.',
                category: 'watering',
                keywords: ['watering', 'frequency', 'how often', 'water schedule', 'terrace plants'],
                helpfulCount: 45,
                notHelpfulCount: 2
            },
            {
                question: 'What are common pests in terrace gardening?',
                answer: 'Common pests include aphids, mealybugs, spider mites, and whiteflies. Use neem oil spray (2ml neem oil + 1ml liquid soap in 1 liter water) weekly as preventive measure. For severe infestations, remove affected parts.',
                category: 'pests',
                keywords: ['pests', 'insects', 'neem oil', 'aphids', 'treatment', 'terrace'],
                helpfulCount: 38,
                notHelpfulCount: 1
            },
            {
                question: 'Which soil is best for terrace gardening?',
                answer: 'Use well-draining potting mix: 40% garden soil + 30% compost/cocopeat + 20% sand + 10% vermicompost. Add perlite for better drainage. Avoid using plain garden soil as it becomes compact.',
                category: 'soil',
                keywords: ['soil', 'potting mix', 'compost', 'drainage', 'cocopeat', 'vermicompost'],
                helpfulCount: 52,
                notHelpfulCount: 0
            },
            {
                question: 'Why are my plant leaves turning yellow?',
                answer: 'Yellow leaves can indicate: 1) Overwatering (most common), 2) Nutrient deficiency (add compost), 3) Poor drainage, 4) Too much sun, or 5) Pests. Check soil moisture and drainage first.',
                category: 'growth',
                keywords: ['yellow leaves', 'problems', 'overwatering', 'deficiency', 'plant health'],
                helpfulCount: 67,
                notHelpfulCount: 3
            },
            {
                question: 'Can I grow vegetables on a small terrace?',
                answer: 'Yes! For small terraces: 1) Use vertical gardening with hanging pots, 2) Grow compact varieties (cherry tomatoes, dwarf chilies), 3) Use container gardening, 4) Try companion planting to maximize space.',
                category: 'general',
                keywords: ['small space', 'vegetables', 'container', 'vertical gardening', 'compact'],
                helpfulCount: 41,
                notHelpfulCount: 2
            },
            {
                question: 'How to prepare compost at home?',
                answer: 'Home composting: 1) Use a compost bin, 2) Add kitchen waste (vegetable peels, fruit waste, coffee grounds), 3) Add brown materials (dry leaves, newspaper), 4) Keep moist, 5) Turn regularly. Takes 2-3 months.',
                category: 'soil',
                keywords: ['compost', 'home composting', 'kitchen waste', 'organic', 'fertilizer'],
                helpfulCount: 58,
                notHelpfulCount: 4
            },
            {
                question: 'Best plants for beginners in terrace gardening?',
                answer: 'Easy plants for beginners: 1) Mint (grows easily), 2) Coriander, 3) Basil, 4) Tomatoes, 5) Chilies, 6) Spinach, 7) Marigold (companion plant). These are hardy and grow well in containers.',
                category: 'growth',
                keywords: ['beginners', 'easy plants', 'terrace', 'container', 'starter plants'],
                helpfulCount: 72,
                notHelpfulCount: 1
            },
            {
                question: 'How to protect plants from heavy rain?',
                answer: 'Rain protection: 1) Move pots to covered area, 2) Ensure good drainage, 3) Use plant covers, 4) Stake tall plants, 5) After rain, check for waterlogging. Heavy rain can wash away nutrients.',
                category: 'general',
                keywords: ['rain', 'protection', 'monsoon', 'waterlogging', 'drainage'],
                helpfulCount: 34,
                notHelpfulCount: 2
            }
        ]);

        console.log(`❓ Created ${faqs.length} FAQ entries`);

        // Create knowledge base articles
        const knowledgeArticles = await KnowledgeBase.create([
            {
                title: 'Beginner\'s Guide to Terrace Gardening',
                content: `# Getting Started with Terrace Gardening

## 1. Planning Your Space
- Assess sunlight (minimum 4-6 hours for vegetables)
- Check weight-bearing capacity of terrace
- Plan drainage system
- Create shade areas if needed

## 2. Choosing Containers
- Use lightweight plastic/polypropylene pots
- Ensure drainage holes
- Size: 12-18 inches for vegetables, 6-8 inches for herbs
- Consider grow bags for root vegetables

## 3. Basic Plants to Start With
- Herbs: Mint, Coriander, Basil
- Vegetables: Tomatoes, Chilies, Spinach
- Flowers: Marigold, Sunflower

## 4. Monthly Maintenance Checklist
- Daily: Check soil moisture
- Weekly: Remove dead leaves
- Monthly: Add compost
- Seasonally: Prune and repot

## 5. Common Mistakes to Avoid
- Overwatering
- Using poor quality soil
- Ignoring pests early
- Not providing support for climbing plants`,
                category: 'beginner',
                tags: ['beginner', 'basics', 'getting started', 'planning', 'terrace'],
                plantTypes: ['herbs', 'vegetables', 'flowers'],
                sunlight: 'full',
                season: 'all',
                difficulty: 'easy',
                author: adminUser._id,
                views: 245
            },
            {
                title: 'Organic Pest Control Methods',
                content: `# Natural Pest Control for Terrace Gardens

## 1. Preventive Measures
- Maintain plant health (healthy plants resist pests better)
- Practice crop rotation
- Use companion planting
- Keep garden clean of debris

## 2. Homemade Sprays

### Neem Oil Spray (Most Effective)
- 2ml neem oil + 1ml liquid soap in 1 liter water
- Spray every 7-10 days
- Best applied in evening

### Garlic-Chilli Spray
- Crush 10 garlic cloves + 5 green chilies
- Soak in 1 liter water for 24 hours
- Strain and spray
- Effective against aphids and mites

## 3. Beneficial Insects
- Ladybugs eat aphids
- Praying mantis control various pests
- Earthworms improve soil health

## 4. Physical Barriers
- Yellow sticky traps for flying insects
- Copper tape for slugs
- Netting for birds

## 5. When to Use Chemical Pesticides
- Only as last resort
- Use organic certified ones
- Follow instructions carefully
- Harvest after safe period`,
                category: 'intermediate',
                tags: ['pests', 'organic', 'natural', 'control', 'neem', 'spray'],
                plantTypes: ['all'],
                sunlight: 'any',
                season: 'all',
                difficulty: 'medium',
                author: adminUser._id,
                views: 189
            },
            {
                title: 'Vertical Gardening Solutions',
                content: `# Maximize Space with Vertical Gardening

## 1. Wall Planters
- Use pocket planters or wall-mounted pots
- Perfect for herbs and small plants
- Ensure proper drainage
- Consider drip irrigation system

## 2. Trellis Systems
- For climbing plants: beans, peas, cucumbers
- DIY trellis with bamboo sticks
- Ensure sturdy structure
- Regular pruning needed

## 3. Hanging Baskets
- Great for trailing plants
- Use coco liners for better moisture retention
- Regular watering needed
- Rotate for even growth

## 4. Tiered Plant Stands
- Create multiple levels
- Use old shelves or DIY stands
- Place sun-loving plants on top
- Easy to move if needed

## 5. Best Plants for Vertical Gardens
- Herbs: Mint, Thyme, Oregano
- Vegetables: Cherry tomatoes, Beans, Peas
- Flowers: Petunias, Nasturtiums
- Succulents: String of pearls, Sedum`,
                category: 'intermediate',
                tags: ['vertical', 'space saving', 'trellis', 'wall garden', 'hanging'],
                plantTypes: ['herbs', 'vegetables', 'flowers', 'succulents'],
                sunlight: 'full',
                season: 'all',
                difficulty: 'medium',
                author: users[3]._id, // Sneha
                views: 156
            },
            {
                title: 'Seasonal Planting Calendar for India',
                content: `# What to Plant When - Indian Climate Guide

## Winter (Oct-Jan)
- Best for: Carrots, Radish, Spinach, Fenugreek
- Temperature: 10-25°C
- Special care: Protect from frost

## Summer (Feb-May)
- Best for: Tomatoes, Chillies, Brinjal, Okra
- Temperature: 25-40°C
- Special care: Regular watering, shade cloth

## Monsoon (Jun-Sep)
- Best for: Cucumber, Bitter gourd, Bottle gourd
- Temperature: 25-35°C
- Special care: Good drainage, pest control

## Year-Round Plants
- Herbs: Mint, Coriander, Curry leaves
- Flowers: Marigold, Rose
- Perennials: Aloe vera, Tulsi

## Regional Variations
- North India: Longer winters, adjust planting
- South India: Can grow year-round
- Coastal areas: Humidity tolerant varieties`,
                category: 'beginner',
                tags: ['seasonal', 'calendar', 'india', 'planting guide', 'climate'],
                plantTypes: ['vegetables', 'herbs', 'flowers'],
                sunlight: 'any',
                season: 'all',
                difficulty: 'easy',
                author: adminUser._id,
                views: 312
            }
        ]);

        console.log(`📚 Created ${knowledgeArticles.length} knowledge articles`);

        // Create plants for users
        const plants = [];
        
        // Create plants for admin
        const adminPlants = await Plant.create([
            {
                name: 'Tomato Plant',
                user: adminUser._id,
                type: 'Cherry Tomato',
                datePlanted: new Date('2024-01-15'),
                lastWatered: new Date(),
                status: 'fruiting',
                location: 'terrace',
                sunlight: 'full',
                images: [
                    {
                        url: PLANT_IMAGES[0],
                        caption: 'First harvest!',
                        date: new Date('2024-03-20')
                    },
                    {
                        url: PLANT_IMAGES[1],
                        caption: 'Flowering stage',
                        date: new Date('2024-02-28')
                    }
                ],
                notes: [
                    {
                        content: 'Started fruiting today. Small green tomatoes visible.',
                        date: new Date('2024-03-15'),
                        type: 'milestone'
                    },
                    {
                        content: 'Added organic fertilizer. Looking healthy.',
                        date: new Date('2024-02-15'),
                        type: 'care'
                    }
                ]
            },
            {
                name: 'Mint Plant',
                user: adminUser._id,
                type: 'Spearmint',
                datePlanted: new Date('2023-12-10'),
                lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 24), // yesterday
                status: 'growing',
                location: 'balcony',
                sunlight: 'partial',
                images: [
                    {
                        url: PLANT_IMAGES[2],
                        caption: 'Growing well',
                        date: new Date('2024-02-10')
                    }
                ],
                notes: [
                    {
                        content: 'Harvested leaves for tea. Very fragrant.',
                        date: new Date('2024-03-10'),
                        type: 'milestone'
                    }
                ]
            }
        ]);
        plants.push(...adminPlants);

        // Create plants for Rajesh (beginner)
        const rajeshPlants = await Plant.create([
            {
                name: 'Chilli Plant',
                user: users[0]._id,
                type: 'Green Chilli',
                datePlanted: new Date('2024-02-01'),
                lastWatered: new Date(),
                status: 'flowering',
                location: 'terrace',
                sunlight: 'full',
                images: [
                    {
                        url: PLANT_IMAGES[3],
                        caption: 'First flowers',
                        date: new Date('2024-03-25')
                    }
                ],
                notes: [
                    {
                        content: 'Plant looking healthy. First buds appeared.',
                        date: new Date('2024-03-20'),
                        type: 'observation'
                    }
                ]
            },
            {
                name: 'Coriander',
                user: users[0]._id,
                type: 'Dhaniya',
                datePlanted: new Date('2024-03-10'),
                lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
                status: 'seedling',
                location: 'window',
                sunlight: 'partial',
                images: [],
                notes: [
                    {
                        content: 'Seeds sprouted after 7 days.',
                        date: new Date('2024-03-17'),
                        type: 'milestone'
                    }
                ]
            }
        ]);
        plants.push(...rajeshPlants);

        // Create plants for Priya (intermediate)
        const priyaPlants = await Plant.create([
            {
                name: 'Strawberry Plant',
                user: users[1]._id,
                type: 'Alpine Strawberry',
                datePlanted: new Date('2023-11-20'),
                lastWatered: new Date(),
                status: 'fruiting',
                location: 'terrace',
                sunlight: 'full',
                images: [
                    {
                        url: PLANT_IMAGES[4],
                        caption: 'First ripe strawberry',
                        date: new Date('2024-03-18')
                    }
                ],
                notes: [
                    {
                        content: 'First harvest! Sweet and delicious.',
                        date: new Date('2024-03-18'),
                        type: 'milestone'
                    },
                    {
                        content: 'Protected from birds using netting.',
                        date: new Date('2024-03-10'),
                        type: 'care'
                    }
                ]
            },
            {
                name: 'Basil Plant',
                user: users[1]._id,
                type: 'Sweet Basil',
                datePlanted: new Date('2024-01-05'),
                lastWatered: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
                status: 'growing',
                location: 'balcony',
                sunlight: 'partial',
                images: [],
                notes: [
                    {
                        content: 'Regular pruning helps bushier growth.',
                        date: new Date('2024-02-20'),
                        type: 'observation'
                    }
                ]
            }
        ]);
        plants.push(...priyaPlants);

        console.log(`🌱 Created ${plants.length} plants for users`);

        // Create marketplace items
        const marketplaceItems = await MarketplaceItem.create([
            {
                title: 'Organic Tomato Seeds',
                description: 'High-quality organic tomato seeds from my garden harvest. Germination rate 95%. Perfect for terrace gardening.',
                seller: adminUser._id,
                category: 'seeds',
                type: 'sell',
                price: 50,
                images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop'],
                location: {
                    city: 'Mumbai',
                    state: 'Maharashtra'
                },
                status: 'available',
                contactMethod: 'in-app'
            },
            {
                title: 'Used Gardening Tools Set',
                description: 'Complete gardening tool set including trowel, pruner, gloves, and watering can. Gently used, in good condition.',
                seller: users[0]._id,
                category: 'tools',
                type: 'sell',
                price: 800,
                images: ['https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=300&fit=crop'],
                location: {
                    city: 'Delhi',
                    state: 'Delhi'
                },
                status: 'available',
                contactMethod: 'phone'
            },
            {
                title: 'Vermicompost - 5kg Bag',
                description: 'Fresh vermicompost from my worm farm. Rich in nutrients, perfect for organic terrace gardening.',
                seller: users[2]._id,
                category: 'compost',
                type: 'exchange',
                price: 0,
                images: ['https://images.unsplash.com/photo-1589923186741-7d1d6ccee3c3?w=400&h=300&fit=crop'],
                location: {
                    city: 'Ahmedabad',
                    state: 'Gujarat'
                },
                status: 'available',
                contactMethod: 'in-app'
            },
            {
                title: 'Money Plant Cuttings',
                description: 'Healthy money plant cuttings, ready to propagate. Free for fellow gardeners.',
                seller: users[3]._id,
                category: 'plants',
                type: 'exchange',
                price: 0,
                images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop'],
                location: {
                    city: 'Hyderabad',
                    state: 'Telangana'
                },
                status: 'available',
                contactMethod: 'email'
            },
            {
                title: 'Looking for Tulsi Plant',
                description: 'Want to buy or exchange for a healthy Tulsi (Holy Basil) plant for medicinal purposes.',
                seller: users[1]._id,
                category: 'plants',
                type: 'buy',
                price: 100,
                images: ['https://images.unsplash.com/photo-1566385101042-1a0f0c126a96?w=400&h=300&fit=crop'],
                location: {
                    city: 'Bangalore',
                    state: 'Karnataka'
                },
                status: 'available',
                contactMethod: 'in-app'
            }
        ]);

        console.log(`🛒 Created ${marketplaceItems.length} marketplace items`);

        // Create specialized communities
        const specialtyCommunities = await Community.create([
            {
                name: 'Urban Vegetable Growers',
                description: 'Specialized community for growing vegetables in urban settings. Share experiences with tomatoes, peppers, leafy greens, and more.',
                admin: users[0]._id,
                visibility: 'public',
                category: 'vegetables',
                members: [users[0]._id, users[1]._id, users[2]._id],
                rules: ['Focus on vegetable gardening', 'Share progress photos', 'Help with troubleshooting'],
                bannerImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1200&h=400&fit=crop'
            },
            {
                name: 'Organic Terrace Farming',
                description: 'For enthusiasts practicing completely organic terrace gardening. Discuss composting, natural pest control, and organic fertilizers.',
                admin: users[2]._id,
                visibility: 'public',
                category: 'organic',
                members: [users[2]._id, users[3]._id, adminUser._id],
                rules: ['Organic methods only', 'No chemical discussions', 'Share organic recipes'],
                bannerImage: 'https://images.unsplash.com/photo-1589923186741-7d1d6ccee3c3?w=1200&h=400&fit=crop'
            },
            {
                name: 'Mumbai Terrace Gardeners',
                description: 'Local community for Mumbai-based terrace gardeners. Discuss local weather, plant varieties suitable for Mumbai climate, and local meetups.',
                admin: adminUser._id,
                visibility: 'public',
                category: 'regional',
                members: [adminUser._id, users[0]._id, users[1]._id],
                rules: ['Mumbai-specific discussions', 'Local weather tips', 'Marathi speakers welcome'],
                bannerImage: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=400&fit=crop'
            },
            {
                name: 'Herb Garden Enthusiasts',
                description: 'Everything about growing herbs on your terrace. From mint and basil to exotic herbs, share your experiences and recipes.',
                admin: users[3]._id,
                visibility: 'public',
                category: 'herbs',
                members: [users[3]._id, users[1]._id, adminUser._id],
                rules: ['Herb-focused discussions', 'Share recipes', 'Growing tips'],
                bannerImage: 'https://images.unsplash.com/photo-1566385101042-1a0f0c126a96?w=1200&h=400&fit=crop'
            },
            {
                name: 'Flower Terrace Garden',
                description: 'For those who love growing flowers on their terraces. Discuss blooming schedules, care tips, and flower arrangement ideas.',
                admin: users[1]._id,
                visibility: 'private',
                category: 'flowers',
                members: [users[1]._id, adminUser._id],
                pendingRequests: [users[0]._id],
                rules: ['Flower gardening only', 'Share photos', 'Be supportive'],
                bannerImage: 'https://images.unsplash.com/photo-1566385101042-1a0f0c126a96?w=1200&h=400&fit=crop'
            }
        ]);

        // Update users with joined communities
        await User.findByIdAndUpdate(users[0]._id, {
            $push: { 
                joinedCommunities: {
                    $each: [
                        specialtyCommunities[0]._id,
                        specialtyCommunities[2]._id
                    ]
                }
            }
        });

        await User.findByIdAndUpdate(users[1]._id, {
            $push: { 
                joinedCommunities: {
                    $each: [
                        specialtyCommunities[0]._id,
                        specialtyCommunities[3]._id,
                        specialtyCommunities[4]._id
                    ]
                }
            }
        });

        await User.findByIdAndUpdate(users[2]._id, {
            $push: { 
                joinedCommunities: {
                    $each: [
                        specialtyCommunities[0]._id,
                        specialtyCommunities[1]._id
                    ]
                }
            }
        });

        await User.findByIdAndUpdate(users[3]._id, {
            $push: { 
                joinedCommunities: {
                    $each: [
                        specialtyCommunities[1]._id,
                        specialtyCommunities[3]._id
                    ]
                }
            }
        });

        console.log(`🏘️  Created ${specialtyCommunities.length} specialty communities`);

        // Create notifications
        const notifications = await Notification.create([
            {
                user: adminUser._id,
                type: 'community_join_request',
                title: 'New Join Request',
                message: 'Rajesh Kumar wants to join Flower Terrace Garden community',
                relatedId: specialtyCommunities[4]._id,
                relatedType: 'community',
                isRead: false
            },
            {
                user: users[1]._id,
                type: 'new_message',
                title: 'New Message',
                message: 'Amit Patel replied to your question about strawberries',
                relatedId: messages[3]._id,
                relatedType: 'message',
                isRead: true
            },
            {
                user: users[3]._id,
                type: 'marketplace_interest',
                title: 'Interest in Your Listing',
                message: 'Someone is interested in your Money Plant Cuttings',
                relatedId: marketplaceItems[3]._id,
                relatedType: 'marketplace',
                isRead: false
            },
            {
                user: users[0]._id,
                type: 'weather_alert',
                title: 'Weather Alert',
                message: 'Heavy rain expected tomorrow. Protect your terrace plants.',
                relatedId: null,
                relatedType: 'weather',
                isRead: false
            },
            {
                user: adminUser._id,
                type: 'community_approved',
                title: 'Welcome to Organic Terrace Farming',
                message: 'Your request to join Organic Terrace Farming has been approved',
                relatedId: specialtyCommunities[1]._id,
                relatedType: 'community',
                isRead: true
            }
        ]);

        console.log(`🔔 Created ${notifications.length} notifications`);

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Users: ${users.length + 1}`);
        console.log(`- Communities: ${1 + specialtyCommunities.length}`);
        console.log(`- Channels: ${channels.length}`);
        console.log(`- Messages: ${messages.length}`);
        console.log(`- FAQ Entries: ${faqs.length}`);
        console.log(`- Knowledge Articles: ${knowledgeArticles.length}`);
        console.log(`- Plants: ${plants.length}`);
        console.log(`- Marketplace Items: ${marketplaceItems.length}`);
        console.log(`- Notifications: ${notifications.length}`);
        console.log('\n🔑 Admin Login:');
        console.log('Email: admin@terracebuddy.com');
        console.log('Password: Admin@123');
        console.log('\n👤 User Logins:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}, Password: User@123`);
        });
        console.log('\n🌐 API Base URL: http://localhost:5000/api');
        console.log('\n🚀 Frontend URL: Open index.html in your browser');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seed function
seedDatabase();