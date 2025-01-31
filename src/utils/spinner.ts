import logUpdate from "log-update";
import chalk from "chalk";

let interval: NodeJS.Timeout | undefined;
export const startSpinner = (message: string) => {
    const spinner =  {
        interval: 80,
        frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    }
    let i = 0;
    let intervalTimer = setInterval(() => {
        const { frames } = spinner;
        logUpdate(chalk.blueBright(frames[i = ++i % frames.length]) + ` ${message}`);
    }, spinner.interval);

    interval = intervalTimer;

    return (message: string, icon: '✔' | '✘') => {
        if (interval){
            clearInterval(interval);
            interval = undefined;
            let iconString = '';
            if (icon == '✘') iconString = chalk.redBright(icon) + ' ';
            if (icon == '✔') iconString = chalk.greenBright(icon) + ' ';
            logUpdate(`${iconString}${message}`);
        }
    }
}

export const stopSpinner = (message: string, icon?: '✔' | '✘') => {
    if (interval){
        clearInterval(interval);
        interval = undefined;
        let iconString = '';
        if (icon == '✘') iconString = chalk.redBright(icon) + ' ';
        if (icon == '✔') iconString = chalk.greenBright(icon) + ' ';
        logUpdate(`${iconString}${message}`);
    }
}