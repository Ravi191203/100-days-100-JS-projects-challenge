// projectCliUpdater.js

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promise-based question function
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Available technology options
const AVAILABLE_TECHNOLOGIES = [
    'HTML', 'CSS', 'JavaScript', 'API', 'React', 
    'Node.js', 'Python', 'Database', 'Vue', 'TypeScript'
];

// Project difficulty levels
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Function to clear the terminal
function clearTerminal() {
    console.clear();
}

// Function to display welcome message
function displayWelcome() {
    console.log(`
${colors.cyan}================================
🚀 100 Days of JavaScript Projects
   Project Update Assistant
================================${colors.reset}

This CLI will help you update your project showcase.
Follow the prompts to add your latest project.
`);
}

// Function to validate day number
function validateDayNumber(day) {
    const num = parseInt(day);
    return num > 0 && num <= 100;
}

// Function to create project directory if it doesn't exist
async function createProjectDirectory(dayNumber) {
    const dirName = `Day${dayNumber.toString().padStart(2, '0')}`;
    try {
        await fs.mkdir(dirName);
        console.log(`${colors.green}✓ Created directory: ${dirName}${colors.reset}`);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
}

// Function to gather project information through CLI
async function gatherProjectInfo() {
    let projectData = {};

    // Get day number
    while (true) {
        const dayNumber = await question(`${colors.bright}Enter project day number (1-100): ${colors.reset}`);
        if (validateDayNumber(dayNumber)) {
            projectData.dayNumber = parseInt(dayNumber);
            break;
        }
        console.log(`${colors.yellow}⚠ Please enter a valid day number between 1 and 100${colors.reset}`);
    }

    // Get project title
    projectData.title = await question(`${colors.bright}Enter project title: ${colors.reset}`);

    // Get difficulty level
    console.log('\nAvailable difficulty levels:');
    DIFFICULTY_LEVELS.forEach((level, index) => {
        console.log(`${index + 1}. ${level}`);
    });
    while (true) {
        const difficulty = await question(`${colors.bright}Select difficulty level (1-${DIFFICULTY_LEVELS.length}): ${colors.reset}`);
        const index = parseInt(difficulty) - 1;
        if (index >= 0 && index < DIFFICULTY_LEVELS.length) {
            projectData.difficulty = DIFFICULTY_LEVELS[index];
            break;
        }
        console.log(`${colors.yellow}⚠ Please enter a valid difficulty number${colors.reset}`);
    }

    // Get project description
    projectData.description = await question(`${colors.bright}Enter project description: ${colors.reset}`);

    // Get technologies used
    console.log('\nAvailable technologies:');
    AVAILABLE_TECHNOLOGIES.forEach((tech, index) => {
        console.log(`${index + 1}. ${tech}`);
    });
    
    projectData.technologies = [];
    while (true) {
        const tech = await question(`${colors.bright}Select technology number (or 'done' to finish): ${colors.reset}`);
        if (tech.toLowerCase() === 'done') {
            if (projectData.technologies.length > 0) break;
            console.log(`${colors.yellow}⚠ Please select at least one technology${colors.reset}`);
            continue;
        }
        
        const index = parseInt(tech) - 1;
        if (index >= 0 && index < AVAILABLE_TECHNOLOGIES.length) {
            const selected = AVAILABLE_TECHNOLOGIES[index];
            if (!projectData.technologies.includes(selected)) {
                projectData.technologies.push(selected);
                console.log(`${colors.green}✓ Added ${selected}${colors.reset}`);
            } else {
                console.log(`${colors.yellow}⚠ ${selected} already selected${colors.reset}`);
            }
        } else {
            console.log(`${colors.yellow}⚠ Please enter a valid technology number${colors.reset}`);
        }
    }

    // Set status as completed
    projectData.status = 'completed';

    return projectData;
}

// Function to generate the HTML
function generateProjectCard(project) {
    const techIcons = {
        'HTML': '<i class="fab fa-html5"></i> HTML',
        'CSS': '<i class="fab fa-css3"></i> CSS',
        'JavaScript': '<i class="fab fa-js"></i> JavaScript',
        'API': '<i class="fas fa-database"></i> API',
        'React': '<i class="fab fa-react"></i> React',
        'Node.js': '<i class="fab fa-node"></i> Node.js',
        'Python': '<i class="fab fa-python"></i> Python',
        'Database': '<i class="fas fa-database"></i> Database',
        'Vue': '<i class="fab fa-vuejs"></i> Vue',
        'TypeScript': '<i class="fab fa-js"></i> TypeScript'
    };

    const formattedDay = project.dayNumber.toString().padStart(2, '0');
    const techTags = project.technologies
        .map(tech => `<span class="meta-tag">${techIcons[tech] || tech}</span>`)
        .join('');

    return `
<a href="Day${formattedDay}/index.html" class="project-link">
    <div class="project-card">
        <div class="project-number">Day ${formattedDay}</div>
        <div class="project-title">${project.title}</div>
        <div class="project-meta">
            <span class="meta-tag difficulty" data-level="${project.difficulty}">
                <i class="fas fa-star"></i> ${project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
            </span>
            ${techTags}
        </div>
        <div class="project-description">
            ${project.description}
        </div>
        <div class="project-status">
            <div class="status-icon status-completed"></div>
            Completed
        </div>
    </div>
</a>`;
}

// Main function
async function main() {
    try {
        clearTerminal();
        displayWelcome();

        // Gather project information
        const projectData = await gatherProjectInfo();

        // Create project directory
        await createProjectDirectory(projectData.dayNumber);

        // Read existing index.html
        const indexPath = path.join(process.cwd(), 'index.html');
        let indexContent = await fs.readFile(indexPath, 'utf8');

        // Generate new project card
        const newCard = generateProjectCard(projectData);

        // Insert new card before template
        indexContent = indexContent.replace(
            /<!-- Template for upcoming projects -->/,
            `${newCard}\n    <!-- Template for upcoming projects -->`
        );

        // Update stats
        const newStats = `
            <div class="stat-card">
                <div class="stat-value">${projectData.dayNumber}</div>
                <div class="stat-label">Projects Complete</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${100 - projectData.dayNumber}</div>
                <div class="stat-label">Days Remaining</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">4.5</div>
                <div class="stat-label">Avg. Difficulty</div>
            </div>`;

        indexContent = indexContent.replace(
            /<div class="stats-container">([\s\S]*?)<\/div>/,
            `<div class="stats-container">${newStats}</div>`
        );

        // Write updated content back to index.html
        await fs.writeFile(indexPath, indexContent, 'utf8');

        console.log(`\n${colors.green}✓ Successfully updated project showcase!${colors.reset}`);
        console.log(`${colors.cyan}→ New project directory: Day${projectData.dayNumber.toString().padStart(2, '0')}${colors.reset}`);
        console.log(`${colors.cyan}→ Updated index.html with new project card${colors.reset}`);
        console.log(`${colors.cyan}→ Updated project statistics${colors.reset}`);

    } catch (error) {
        console.error(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    } finally {
        rl.close();
    }
}

// Run the program
main();