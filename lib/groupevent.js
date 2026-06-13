module.exports = async (conn, update) => {
    const { action, participants } = update;
    if (action === 'add') console.log('New member joined');
    else if (action === 'remove') console.log('Member left');
};
