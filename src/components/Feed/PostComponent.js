import React, {Component} from 'react';
import {
    ActionSheet,
    Body,
    Button,
    Card,
    CardItem,
    Container,
    Content,
    Form,
    H1,
    Icon,
    Input,
    Item,
    Label,
    Left,
    Right,
    Text,
    Toast
} from "native-base";
import {Dimensions, Image, Share, StyleSheet, View} from "react-native";
import Modal from "react-native-modal";
import {Mutation} from "react-apollo";
import {ADD_COMMENT, LIKE_COMMENT, LIKE_POST, LOAD_POST, UNLIKE_COMMENT, UNLIKE_POST} from "../../network/Feed.gql";
import moment from 'moment/min/moment-with-locales';
import de from 'moment/locale/de';
import material from '../../../native-base-theme/variables/material';
import env from '../../../env';
import {Util} from "../../util";
import {LocalizationProvider as L} from "../../localization/LocalizationProvider";
import * as PropTypes from "prop-types";
import {MaterialDialog} from "react-native-material-dialog";

moment.locale('de');


class PostComponent extends Component {
    state = {
        showReportDialog: false,
        showDeleteDialog: false,

    }
    overflowActionsConfig = {
        config:
            {
                options: [
                    {text: "Teilen", icon: "share", iconColor: material.textLight},
                    {text: "Melden", icon: "md-alert", iconColor: material.textLight},
                    {text: "Abbrechen", icon: "md-alert", iconColor: material.textLight}
                ],
                cancelButtonIndex: 2,
                destructiveButtonIndex: 1,
            },
        callback: (buttonIndex) => {
            this.overflowActionsConfig.actions[buttonIndex]();
            this.actionSheetAction({
                index: buttonIndex,
                pressed: this.overflowActionsConfig.config.options[buttonIndex]
            });
        },
        actions: [
            () => {
                this.sharePost().catch(error => console.error(error));
                console.log("action share")
            },
            () => {
                this.setState({showReportDialog: true})
                console.log("action report")

            },
            () => {
                console.log("action cancelled")
            },

        ],
    };

    sharePost = async () => {
        try {
            const result = await Share.share({
                message:
                    `${this.props.post.title} | Klimafuchs App`,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    actionSheetAction(param) {
        this.overflowActionsConfig.actions[param.index]();
    }

    render() {
        let {post, navigateToDetailedView, commentRefetch, close} = this.props;
        let cardMedia, header, cardFooter, commentSection;
        let displayedTime = moment(post.dateCreated).fromNow();

        if (post.ytId) {
            cardMedia = <Text>TODO render yt embed here</Text>
        } else if (post.image) {
            const url = `${env.dev.API_IMG_URL}${post.image.filename}`;
            const imageAspectRatio = post.image.height / post.image.width;
            const width = (Dimensions.get('window').width);
            const height = (Dimensions.get('window').height);
            //TODO ENHANCEMENT add lightbox?
            cardMedia = <View style={
                {
                    flex: 1,
                }
            }>
                <Image
                    style={{width: '100%', height: width * imageAspectRatio}}
                    source={{uri: url}}
                    resizeMode={navigateToDetailedView ? "cover" : "contain"}
                />
            </View>
        }
        if (navigateToDetailedView) {
            cardFooter = <CardItem>
                <Left>
                    <LikeButton post={post}/>
                </Left>
                <Right>
                    <Button transparent
                            onPress={navigateToDetailedView}>
                        <Text>{L.get("feed_comments", {commentCount: post.commentCount})}</Text>
                    </Button>
                </Right>
            </CardItem>
        } else {
            header = <View>
                <Body style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{alignSelf: 'center', flex: 1, alignItems: 'center'}}>
                        {L.get("feed_post_author_description",
                            {screenName: post.author.screenName, displayedTime: displayedTime})}
                    </Text>
                </Body>
            </View>

            cardFooter = <CardItem last style={{flexDirection: 'row', flex: 1}}>
                <LikeButton post={post}/>
                <AddCommentWidget postId={post.id}/>
            </CardItem>
        }

        let card =
            <Card style={{flex: 1}}>
                <CardItem>
                    {cardMedia}
                </CardItem>
                {navigateToDetailedView ?
                    <CardItem>
                        <Left style={{flex:4}}>
                            <Image
                                style={{
                                    width: 32,
                                    height: 32,
                                }}
                                source={{uri: Util.AvatarToUri(post.author.avatar)}}
                                resizeMode="contain"
                            />
                            <Body style={{paddingLeft: 10, justifyContent: 'center', alignItems: 'flex-start'}}>
                                <H1>{post.title}</H1>
                                <Text style={{alignSelf: 'flex-start', flex: 1, alignItems: 'center'}}>
                                    {L.get("feed_post_author_description",
                                        {screenName: post.author.screenName, displayedTime: displayedTime})}
                                </Text>
                            </Body>
                        </Left>
                        <Right>
                            <Button transparent onPress={() => {
                                ActionSheet.show(
                                    this.overflowActionsConfig.config,
                                    this.overflowActionsConfig.callback
                                )
                            }}
                                    style={{width: 25}}>
                                <Icon name='md-more' style={{color: material.textLight}}/>
                            </Button>
                        </Right>
                    </CardItem>
                    : <CardItem>
                        <H1>{post.title}</H1>
                    </CardItem>}

                {navigateToDetailedView
                    ? <CardItem button onPress={navigateToDetailedView}>
                        <Text>
                            {post.body.length > 140
                                ? `${post.body.substr(0, 139)}...`
                                : post.body}
                        </Text>
                    </CardItem>
                    : <CardItem>
                        <Text>{post.body}</Text>
                    </CardItem>
                }

                {cardFooter}
            </Card>
        if (navigateToDetailedView) {
            return (
                <View>
                    {card}
                    <MaterialDialog
                        title={L.get("report_post_dialog_title")}
                        visible={this.state.showReportDialog}
                        okLabel={L.get("report_post_dialog_ok_label")}
                        cancelLabel={L.get("report_post_dialog_cancel_label")}
                        onOk={() => {
                            //TODO report post
                            this.setState({showReportDialog: false})}
                        }
                        onCancel={() => this.setState({showReportDialog: false})}>
                        <Text>
                            {L.get("report_post_dialog_body")}
                        </Text>
                    </MaterialDialog>
                </View>
            )
        } else {
            return (
                <Container>
                    <Content>
                        {!navigateToDetailedView && header}
                        {card}
                        {commentRefetch && <CommentTreeWidget comments={post.comments} postId={post.id}
                                                              refetch={commentRefetch}/>}
                    </Content>

                </Container>
            )
        }
    }
}

PostComponent.propTypes = {
    post: PropTypes.any,
    navigateToDetailedView: PropTypes.any,
    commentRefetch: PropTypes.any,
    close: PropTypes.any
}

class AddCommentWidget extends Component {
    state = {
        modalVisible: false,
        body: ''
    };

    setModalVisible() {
        this.setState({modalVisible: true});
    }

    closeModal() {
        this.setState({body: '', modalVisible: false});
    }

    renderButton() {
        if (this.props.compact) {
            return (
                <Button transparent
                        primary
                        small
                        onPress={() => {
                            this.setModalVisible();
                        }}>
                    <Icon name='md-chatbubbles'/>
                </Button>
            )
        } else {
            return (
                <Button transparent primary
                        onPress={() => {
                            this.setModalVisible();
                        }}>
                    <Icon name='md-chatbubbles'/>
                    <Text>Kommentieren</Text>
                </Button>
            )
        }
    }

    render() {
        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    style={styles.modal}
                    onBackButtonPress={() => this.closeModal()}
                    onRequestClose={() => this.closeModal()}>
                    <Mutation key={this.props.postId}
                              mutation={ADD_COMMENT}
                              refetchQueries={[{
                                      query: LOAD_POST,
                                      variables: {postId: this.props.postId}
                                  }
                              ]}

                    >
                        {(addComment, {data}) => (
                            <Card transparent style={styles.modalContent}>
                                <CardItem first style={{backgroundColor: 'rgba(0,0,0,0)'}}>
                                    <Form style={{flex: 1}}>
                                        <Item floatingLabel>
                                            <Label>Text</Label>
                                            <Input name="comment"
                                                   onChangeText={(text) => this.setState({body: text})}
                                                   value={this.state.body}/>
                                        </Item>
                                    </Form>
                                </CardItem>
                                <CardItem last style={{backgroundColor: 'rgba(0,0,0,0)', flexDirection: 'row'}}>
                                    <Left style={{width: 'auto', flex: 1}}>
                                        <Button transparent info onPress={() => {
                                            this.closeModal();
                                        }}>
                                            <Text> Abbrechen </Text>

                                        </Button>
                                    </Left>
                                    <Right style={{width: 'auto', flex: 1, justifyContent: 'flex-end'}}>
                                        <Button transparent disabled={!this.state.body.length > 0}
                                                onPress={async () => {
                                                    this.closeModal();
                                                    await addComment({
                                                        variables: {
                                                            postId: this.props.postId,
                                                            parentId: this.props.parentId,
                                                            body: this.state.body
                                                        }
                                                    });
                                                    if (this.props.refetch) this.props.refetch()
                                                }}>
                                            <Text> Kommentieren </Text>
                                        </Button>
                                    </Right>
                                </CardItem>
                            </Card>
                        )}
                    </Mutation>
                </Modal>
                {this.renderButton()}
            </View>
        )
    }
}

class CommentTreeWidget extends Component {

    sortComments = (a, b) => b.sentiment - a.sentiment;
    maxRecursionDepth = 900;

    buildCommentTree = (comments) => {
        let tree = comments.filter((c) => !c.parent);
        tree.sort(this.sortComments);

        tree.forEach((branchRoot) => {
            if (!branchRoot.children) return;
            this._buildCommentTree(comments, branchRoot, this.maxRecursionDepth)
        });

        return tree;
    };

    _buildCommentTree = (comments, branch, recursionDepth) => {
        if (recursionDepth <= 0) return;
        let current = branch;
        if (!current.children) return;
        current["childComments"] = current.children.map(id => {
            return comments.find(c => {
                return c.id === id.id
            })
        });
        if (!current.childComments) return;
        current.childComments.sort(this.sortComments);
        current.childComments.forEach(child => this._buildCommentTree(comments, child, recursionDepth - 1));
    };

    walkTree = (commentTree) => {

        let tree = commentTree.map(branch => this._walkTree(branch, this.maxRecursionDepth))
        return tree;
    };

    _walkTree = (currentNode, recursionDepth) => {
        let below;
        if (currentNode.childComments && currentNode.childComments.length > 0 && recursionDepth >= 0) {
            console.log("reached below");
            below =
                <View style={styles.commentWidget}>
                    {currentNode.childComments.map(branch => this._walkTree(branch, recursionDepth - 1))}
                </View>
        }
        return (
            <View key={currentNode.id} style={{margin: 10}}>
                <CommentWidget comment={currentNode} postId={this.props.postId} refetch={this.props.refetch}/>
                {below}
            </View>
        )
    };


    render() {
        let result = this.buildCommentTree(this.props.comments);
        return (
            <View style={{flex: 1, flexShrink: 0, alignItems: 'stretch', width: '100%'}}>
                {result.map(tree => this._walkTree(tree, this.maxRecursionDepth))}
            </View>
        );
    }


}

class CommentWidget extends Component {
    LikeCommentButton = ({comment}) => {
        if (comment.currentUserLikesComment) {
            return (
                <Mutation mutation={UNLIKE_COMMENT}
                          key={comment.id}>
                    {(unlikeComment) => {
                        return (<Button transparent small
                                        onPress={async () => {
                                            await unlikeComment({variables: {commentId: comment.id}});
                                        }}
                            >
                                <Text style={{color: '#000'}}>{comment.sentiment}</Text>
                                <Icon style={{color: '#000'}} name="md-thumbs-up"/>
                            </Button>
                        )
                    }}
                </Mutation>
            )
        } else {
            return (
                <Mutation mutation={LIKE_COMMENT}
                          key={comment.id}>
                    {(likeComment) => {
                        return (<Button transparent small
                                        onPress={async () => {
                                            await likeComment({variables: {commentId: comment.id}});
                                        }}
                            >
                                <Text style={{color: '#aaa'}}>{comment.sentiment}</Text>
                                <Icon style={{color: '#aaa'}} name="md-thumbs-up"/>
                            </Button>
                        )
                    }}
                </Mutation>

            )
        }
    }

    render() {
        let comment = this.props.comment;
        let displayedTime = moment(comment.dateCreated).fromNow();
        return (
            <View style={styles.commentCard}>
                <View style={styles.commentCardText}>
                    <Text style={{
                        fontSize: 10,
                        fontStyle: 'normal'
                    }}>
                        {L.get("feed_post_author_description",
                            {screenName: comment.author.screenName, displayedTime: displayedTime})}
                    </Text>
                </View>
                <View style={styles.commentCardText}>
                    <Text>{comment.body}</Text>
                </View>
                <View style={styles.commentCardActions}>
                    <this.LikeCommentButton comment={comment}/>
                    <AddCommentWidget postId={this.props.postId} parentId={comment.id}
                                      refetch={this.props.refetch} compact/>
                </View>
            </View>
        )
    }
}

class LikeButton extends Component {
    likesButton = ({mutation, post}) => {
        return (
            <Button transparent
                    onPress={async () => {
                        await mutation({variables: {postId: post.id}});
                    }}
            >
                <Text
                    style={{color: post.currentUserLikesPost ? '#000' : '#aaa'}}
                >
                    {post.sentiment} <Icon
                    style={{color: post.currentUserLikesPost ? '#000' : '#aaa', fontSize: 14}}
                    name="md-thumbs-up" />
                </Text>
            </Button>
        )
    }

    render() {
        const post = this.props.post;
        if (post.currentUserLikesPost) {
            return (
                <Mutation mutation={UNLIKE_POST}
                          key={post.id}>
                    {(unlikePost) => {
                        return (this.likesButton({mutation: unlikePost, post: post}))
                    }}
                </Mutation>
            )
        } else {
            return (
                <Mutation mutation={LIKE_POST}
                          key={post.id}
                >
                    {(likePost, {data}) => {
                        return (this.likesButton({mutation: likePost, post: post}))
                    }}
                </Mutation>
            )
        }
    }
}


const styles = StyleSheet.create({
    modal: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        margin: 0,
    },
    modalContent: {
        margin: 45, // This is the important style you need to set
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,1)',
        height: 'auto',
        flex: 0,
        padding: 10
    },
    commentWidget: {
        borderLeftWidth: 5,
        marginLeft: 10,
        marginRight: 0,
        padding: 0,
        borderLeftColor: '#68cdff',
        backgroundColor: 'rgba(255,0,255,0)',
        flex: 1,
        alignSelf: 'stretch',
        width: '100%',

    },
    commentCard: {
        marginLeft: 0,
        marginRight: 0,
        margin: 0,
        padding: 0,
        flex: 1,
        flexShrink: 0,
        alignSelf: 'stretch',
        backgroundColor: 'rgba(255,255,0,0)',
        width: '100%',

    },
    commentCardText: {
        flex: 1,
        marginLeft: 0,
        marginRight: 0,
        padding: 0,
        backgroundColor: 'rgba(0,255,255,0)',
        alignSelf: 'stretch',

    },
    commentCardActions: {
        margin: 0,
        padding: 0,
        alignSelf: 'stretch',
        backgroundColor: 'rgba(255,0,255,0)',
        flexDirection: 'row',
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexShrink: 0,
    },
});

export default PostComponent;