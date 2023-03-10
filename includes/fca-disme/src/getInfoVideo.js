"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
    async function downloadStory(url, callback) {
        var resolveFunc = function () { };
        var rejectFunc = function () { };
        var returnPromise = new Promise(function (resolve, reject) {
          resolveFunc = resolve;
          rejectFunc = reject;
        });
        if (!callback) {
            callback = function (err, data) {
                if (err) return rejectFunc(err);
                resolveFunc(data);
            };
        }
        var form = {
            av: ctx.userID,
            fb_api_caller_class: "RelayModern",
            fb_api_req_friendly_name: "StoriesViewerBucketPrefetcherMultiBucketsQuery",
            doc_id: "2913003758722672",
            variables: JSON.stringify({
                "bucketIDs": url.split('/')[4],
                "scale": 1,
                "prefetchPhotoUri":false
            })
        };
        defaultFuncs.post("https://www.facebook.com/api/graphql/", ctx.jar, form)
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
            .then(function (resData) {
                if (resData.errors) throw resData;
                if(resData.error) return callback("Không thể tìm kiếm video này");
                var data = resData.data.nodes[0].unified_stories.edges
                var str = data.find(i => i.node.id == url.split('/')[5]);
                console.log()
                if(str == null) return callback('Không thể tìm kiếm video này');
                return callback(null, {
                    author: {
                        type: resData.data.nodes[0].story_bucket_owner.__typename,
                        name: resData.data.nodes[0].story_bucket_owner.name,
                        uid: resData.data.nodes[0].story_bucket_owner.id,
                        urlProfile: resData.data.nodes[0].story_bucket_owner.url
                    },
                    id: str.node.id,
                    metadata: {
                        count_react: str.node.story_card_info.feedback_summary.total_reaction_count
                    },
                    dataVideo: str.node.attachments[0].media
                });
            })
        return returnPromise
    }
    return async function getInfoVideo(videoURL, callback) {
        var resolveFunc = function () { };
        var rejectFunc = function () { };
        var returnPromise = new Promise(function (resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        if (!callback) {
            callback = function (err, data) {
                if (err) return rejectFunc(err);
                resolveFunc(data);
            };
        }
        if(videoURL.indexOf('stories') !== -1) return await downloadStory(videoURL);
        videoURL = videoURL.match(/\/(?:videos|reel|watch)(?:\/?)(?:\?v=)?(\d+)/);
        if (videoURL.length < 2) { 
            return callback(new Error("Invalid video URL")); 
        }
        var form = {
            av: ctx.userID,
            server_timestamps: true,
            doc_id: "5279476072161634",
            variables: JSON.stringify({
                UFI2CommentsProvider_commentsKey: 'CometTahoeSidePaneQuery',
                caller: 'CHANNEL_VIEW_FROM_PAGE_TIMELINE',
                displayCommentsContextEnableComment: null,
                displayCommentsContextIsAdPreview: null,
                displayCommentsContextIsAggregatedShare: null,
                displayCommentsContextIsStorySet: null,
                displayCommentsFeedbackContext: null,
                feedbackSource: 41,
                feedLocation: 'TAHOE',
                focusCommentID: null,
                privacySelectorRenderLocation: 'COMET_STREAM',
                renderLocation: 'video_channel',
                scale: 1,
                streamChainingSection: false,
                useDefaultActor: false,
                videoChainingContext: null,
                videoID: videoURL[1],
            })
        };
        defaultFuncs
            .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
            .then(function (resData) {
                if (resData.errors) throw resData;
                let a = resData[0];
                let b = resData[12];
                if(a.data.video == null) return callback('URL không hợp lệ');
                resData = {
                    url: a.data.video.url || null,
                    id: a.data.video.videoId || null,
                    title: (b.data.tahoe_sidepane_renderer.video.creation_story.comet_sections.message != null) ? b.data.tahoe_sidepane_renderer.video.creation_story.comet_sections.message.story.message.text : 'Không có tiêu đề',
                    playable_duration_in_ms: a.data.video.playable_duration_in_ms || null,
                    author: {
                        type: b.data.tahoe_sidepane_renderer.video.owner.__typename || null,
                        id: b.data.tahoe_sidepane_renderer.video.owner.id || null,
                        name: b.data.tahoe_sidepane_renderer.video.owner.name || null
                    },
                    metadata: {
                        count_react: b.data.tahoe_sidepane_renderer.video.feedback.reaction_count.count || null,
                        count_share: b.data.tahoe_sidepane_renderer.video.feedback.share_count.count || null,
                        count_comment: b.data.tahoe_sidepane_renderer.video.feedback.comment_count.total_count || null
                    },
                    downloadVideo: {
                        SD: a.data.video.playable_url || null,
                        HD: a.data.video.playable_url_quality_hd || null
                    }
                }
                callback(null, resData);
            })
            .catch(function (err) {
                callback(err);
            });
        return returnPromise;
    }
}