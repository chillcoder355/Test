class AFKManager {
    constructor() {
        this.afkUsers = new Map();
    }

    setAFK(userId, serverId, reason, isGlobal) {
        const key = isGlobal ? `${userId}:global` : `${userId}:${serverId || 'dm'}`;
        const afkData = {
            timestamp: Date.now(),
            reason: reason,
            isGlobal: isGlobal,
            serverId: serverId,
            pingCount: 0,
            lastPingedBy: null
        };
        
        this.afkUsers.set(key, afkData);
        
        // Remove any conflicting AFK status
        if (isGlobal) {
            // Remove server-specific AFK if setting global
            this.afkUsers.delete(`${userId}:${serverId || 'dm'}`);
        } else {
            // Remove global AFK if setting server-specific
            this.afkUsers.delete(`${userId}:global`);
        }
    }

    removeAFK(userId, serverId) {
        // Check global first
        const globalKey = `${userId}:global`;
        if (this.afkUsers.has(globalKey)) {
            const data = this.afkUsers.get(globalKey);
            this.afkUsers.delete(globalKey);
            return data;
        }
        
        // Check server-specific
        const serverKey = `${userId}:${serverId || 'dm'}`;
        if (this.afkUsers.has(serverKey)) {
            const data = this.afkUsers.get(serverKey);
            this.afkUsers.delete(serverKey);
            return data;
        }
        
        return null;
    }

    isUserAFK(userId, serverId) {
        // Check global first
        if (this.afkUsers.has(`${userId}:global`)) {
            return true;
        }
        
        // Check server-specific
        const serverKey = `${userId}:${serverId || 'dm'}`;
        return this.afkUsers.has(serverKey);
    }

    getAFKData(userId, serverId) {
        // Check global first
        const globalKey = `${userId}:global`;
        if (this.afkUsers.has(globalKey)) {
            return this.afkUsers.get(globalKey);
        }
        
        // Check server-specific
        const serverKey = `${userId}:${serverId || 'dm'}`;
        return this.afkUsers.get(serverKey) || null;
    }

    addPing(userId, pingerId, serverId) {
        const afkData = this.getAFKData(userId, serverId);
        if (afkData) {
            afkData.pingCount++;
            afkData.lastPingedBy = pingerId;
        }
    }

    formatDuration(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const days = Math.floor(totalSeconds / 86400);

        let result = [];
        
        if (days > 0) result.push(`${days}d`);
        if (hours > 0) result.push(`${hours}h`);
        if (minutes > 0) result.push(`${minutes}m`);
        if (seconds > 0) result.push(`${seconds}s`);
        
        // If no time has passed, show 0s
        if (result.length === 0) result.push('0s');
        
        return result.join(' ');
    }
}

module.exports = AFKManager;