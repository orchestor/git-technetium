module.exports = function(router, request) {
    // Router will handle any requests with this endpoint depending on where router is "use()'d.
    router.get('/helloworld', function(req, res) {
        // Returns a JSON response when user visits this endpoint
        var url = 'http://nhlwc.cdnak.neulion.com/fs1/nhl/league/teamroster/PIT/iphone/clubroster.json';
        request(url, function(error, response, body){
            if(!error && response.statusCode === 200){
                res.send(body);
            }
        });
    });

    router.get('/issues', function(req, res) {
        request({
            url: 'https://api.github.com/repos/' + req.query.ownerName + '/' + req.query.repoName + '/issues?state=all',
            headers: { 'user-agent': 'git-technetium' },
            json: true
        }, function(error, response, body) {
            if(!error && response.statusCode === 200) {
                var issueTitles = [];
                for(var issueIndex = 0; issueIndex < body.length; issueIndex++) {
                    if(!body[issueIndex].pull_request) {
                        issueTitles.push(body[issueIndex].title);
                    }
                }
                res.send(issueTitles);
            }
        });
    });

    router.get('/issues_opened', function(req, res) {
        request({
            url: 'https://api.github.com/repos/' + req.query.ownerName + '/' + req.query.repoName + '/contributors',
            headers: { 'user-agent': 'git-technetium' },
            json: true
        }, function(error, response, body) {
            if(!error && response.statusCode === 200) {
                var contributors = [];
                for(var contributorIndex = 0; contributorIndex < body.length; contributorIndex++){
                    contributors.push(body[contributorIndex].login);
                }

                var contributorIssuesOpened = [];
                for(var contributorIndex = 0; contributorIndex < contributors.length; contributorIndex++) {
                    contributorIssuesOpened.push({
                        'name': contributors[contributorIndex],
                        'issues_opened': 0
                    });
                }

                request({
                    url: 'https://api.github.com/repos/' + req.query.ownerName + '/' + req.query.repoName + '/issues?state=all',
                    headers: { 'user-agent': 'git-technetium' },
                    json: true
                }, function(error, response, body) {
                    if(!error && response.statusCode === 200) {
                        for(var issueIndex = 0; issueIndex < body.length; issueIndex++) {
                            if(!body[issueIndex].pull_request) {
                                for(var contributorIndex = 0; contributorIndex < contributorIssuesOpened.length; contributorIndex++) {
                                    if(body[issueIndex].user.login === contributorIssuesOpened[contributorIndex].name) {
                                        contributorIssuesOpened[contributorIndex].issues_opened++;
                                    }
                                }
                            }
                        }

                        res.send(contributorIssuesOpened);
                    }
                });
            }
        });
    });

    /**
      * Route to query total commits per contributor within a given repository.
      * params: owner, repo
      * github api endpoint: https://api.github.com/repos/:owner/:repo/stats/contributors
    **/
    router.get('/commits', function(req, res){
        request({
            url: 'https://api.github.com/repos/' + req.query.owner + '/' + req.query.repo + '/stats/contributors',
            headers: { 'user-agent': 'git-technetium' },
            json: true
        }, function(error, response, body){
            if(!error && response.statusCode === 200){
                var contributors = [];
                for(var contributor_index = 0; contributor_index < body.length; contributor_index++){
                    contributors.push("Author: " + body[contributor_index].author.login + " , " + "Commits: " + body[contributor_index].total);
                }
                res.send(contributors);
                
            }
        });
    });

     /**
      * Route to query total commit comments per contributor within a given repository.
      * params: owner, repo
      * github api endpoint: https://api.github/com/repos/:owner/:repo/comments
    **/
    router.get('/commitComments', function(req, res){
        // First request builds a list of all contributors for a given repository.
        request({
            url: 'https://api.github.com/repos/DrkSephy/git-technetium/contributors',
            headers: { 'user-agent': 'git-technetium' },
            json: true
        }, function(error, response, body){
            if(!error && response.statusCode === 200){
                var contributors =[];

                for(var contributor_index = 0; contributor_index < body.length; contributor_index++){
                    contributors.push(body[contributor_index].login);
                }

                var contributor_comments = [];
                for(var contributor_index = 0; contributor_index < contributors.length; contributor_index++){
                    contributor_comments[contributor_index] = {
                        'name': contributors[contributor_index],
                        'commit_comments': 0
                    };
                }

                request({
                    url: 'https://api.github.com/repos/' + req.query.owner + '/' + req.query.repo + '/comments',
                    headers: { 'user-agent' : 'git-technetium' },
                    json: true
                }, function(error, response, body){
                    if(!error && response.statusCode === 200){
                        // Loop through each comment, check if the commenter name matches a contributor.
                        // If match, increment commit_comments by 1. 
                        for(var comment_index = 0; comment_index < body.length; comment_index++){
                            for(var contributor_index = 0; contributor_index < contributors.length; contributor_index++){
                                if(body[comment_index].user.login === contributor_comments[contributor_index].name){
                                    contributor_comments[contributor_index].commit_comments++;
                                }
                            }
                        }
                        res.send(contributor_comments)
                    }
                }); // End second request function
            }
        }); // End first request function
    });
}