// projectEditor.js

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio'); // You'll need to install this: npm install cheerio

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

const AVAILABLE_TECHNOLOGIES = [
    'HTML', 'CSS', 'JavaScript', 'API', 'React', 
    'Node.js', 'Python', 'Database', 'Vue', 'TypeScript'
];

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

async function findProject(dayNumber) {
    try {
        const indexContent = await fs.readFile('index.html', 'utf8');
        const $ = cheerio.load(indexContent);
        
        const projectCard = $(`.project-card:contains("Day ${dayNumber.toString().padStart(2, '0')}")`);
        if (projectCard.length === 0) {
            throw new Error(`Project for Day ${dayNumber} not found`);
        }

        return {
            dayNumber: dayNumber,
            title: projectCard.find('.project-title').text().trim(),
            description: projectCard.find('.project-description').text().trim(),
            difficulty: projectCard.find('.difficulty').attr('data-level'),
            technologies: projectCard.find('.meta-tag')
                .map((_, el) => $(el).text().trim())
                .get()
                .filter(tech => tech !== 'Easy' && tech !== 'Medium' && tech !== 'Hard')
                .map(tech => tech.replace(/^\S+\s/, '')) // Remove icons
        };
    } catch (error) {
        throw new Error(`Error finding project: ${error.message}`);
    }
}

async function displayProjectDetails(project) {
    console.log(`\n${colors.cyan}Current Project Details:${colors.reset}`);
    console.log(`${colors.bright}Day Number:${colors.reset} ${project.dayNumber}`);
    console.log(`${colors.bright}Title:${colors.reset} ${project.title}`);
    console.log(`${colors.bright}Description:${colors.reset} ${project.description}`);
    console.log(`${colors.bright}Difficulty:${colors.reset} ${project.difficulty}`);
    console.log(`${colors.bright}Technologies:${colors.reset} ${project.technologies.join(', ')}`);
}

async function updateProjectDetails(project) {
    console.log(`\n${colors.cyan}Update Project Details${colors.reset}`);
    console.log('(Press Enter to keep current value)\n');

    // Update title
    const newTitle = await question(`${colors.bright}New title ${colors.yellow}(current: ${project.title})${colors.reset}: `);
    if (newTitle.trim()) project.title = newTitle;

    // Update description
    const newDesc = await question(`${colors.bright}New description ${colors.yellow}(current: ${project.description})${colors.reset}: `);
    if (newDesc.trim()) project.description = newDesc;

    // Update difficulty
    console.log('\nDifficulty levels:');
    DIFFICULTY_LEVELS.forEach((level, index) => {
        console.log(`${index + 1}. ${level}`);
    });
    const newDiff = await question(`${colors.bright}New difficulty ${colors.yellow}(current: ${project.difficulty})${colors.reset}: `);
    if (newDiff.trim()) {
        const index = parseInt(newDiff) - 1;
        if (index >= 0 && index < DIFFICULTY_LEVELS.length) {
            project.difficulty = DIFFICULTY_LEVELS[index];
        }
    }

    // Update technologies
    console.log('\nAvailable technologies:');
    AVAILABLE_TECHNOLOGIES.forEach((tech, index) => {
        console.log(`${index + 1}. ${tech}`);
    });
    console.log(`\nCurrent technologies: ${project.technologies.join(', ')}`);
    
    const updateTech = await question(`${colors.bright}Update technologies? (y/n)${colors.reset}: `);
    if (updateTech.toLowerCase() === 'y') {
        project.technologies = [];
        while (true) {
            const tech = await question(`${colors.bright}Select technology number (or 'done' to finish): ${colors.reset}`);
            if (tech.toLowerCase() === 'done') {
                if (project.technologies.length > 0) break;
                console.log(`${colors.yellow}⚠ Please select at least one technology${colors.reset}`);
                continue;
            }
            
            const index = parseInt(tech) - 1;
            if (index >= 0 && index < AVAILABLE_TECHNOLOGIES.length) {
                const selected = AVAILABLE_TECHNOLOGIES[index];
                if (!project.technologies.includes(selected)) {
                    project.technologies.push(selected);
                    console.log(`${colors.green}✓ Added ${selected}${colors.reset}`);
                } else {
                    console.log(`${colors.yellow}⚠ ${selected} already selected${colors.reset}`);
                }
            }
        }
    }

    return project;
}

function generateUpdatedHTML(project) {
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

async function updateIndexFile(project) {
    try {
        const indexContent = await fs.readFile('index.html', 'utf8');
        const $ = cheerio.load(indexContent);
        
        // Find and replace the old project card
        const oldCard = $(`.project-card:contains("Day ${project.dayNumber.toString().padStart(2, '0')}")`).closest('.project-link');
        const newCard = generateUpdatedHTML(project);
        oldCard.replaceWith(newCard);

        // Write the updated content back to the file
        await fs.writeFile('index.html', $.html(), 'utf8');
        
        console.log(`\n${colors.green}✓ Successfully updated project!${colors.reset}`);
    } catch (error) {
        throw new Error(`Error updating index.html: ${error.message}`);
    }
}

async function main() {
    try {
        console.clear();
        console.log(`
${colors.cyan}================================
🔄 Project Update Assistant
================================${colors.reset}
`);

        // Get day number to edit
        const dayNumber = parseInt(await question(`${colors.bright}Enter the day number of the project to update: ${colors.reset}`));
        
        if (!dayNumber || dayNumber < 1 || dayNumber > 100) {
            throw new Error('Invalid day number. Please enter a number between 1 and 100.');
        }

        // Find existing project
        const project = await findProject(dayNumber);
        
        // Display current details
        await displayProjectDetails(project);
        
        // Confirm edit
        const confirm = await question(`\n${colors.bright}Do you want to update this project? (y/n): ${colors.reset}`);
        
        if (confirm.toLowerCase() === 'y') {
            // Update project details
            const updatedProject = await updateProjectDetails(project);
            
            // Show summary of changes
            console.log(`\n${colors.cyan}Updated Project Details:${colors.reset}`);
            await displayProjectDetails(updatedProject);
            
            // Confirm changes
            const confirmUpdate = await question(`\n${colors.bright}Save these changes? (y/n): ${colors.reset}`);
            
            if (confirmUpdate.toLowerCase() === 'y') {
                await updateIndexFile(updatedProject);
            } else {
                console.log(`\n${colors.yellow}Update cancelled${colors.reset}`);
            }
        } else {
            console.log(`\n${colors.yellow}Operation cancelled${colors.reset}`);
        }

    } catch (error) {
        console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    } finally {
        rl.close();
    }
}

// Run the program
main();