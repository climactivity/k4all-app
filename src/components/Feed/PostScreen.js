import React, {Component, Fragment} from 'react';
import {Body, Button, Container, Header, Icon, Left, Right, Text, Title} from "native-base";
import {Query} from "react-apollo";
import {LOAD_POST} from "../../network/Feed.gql";
import {AppLoading} from "expo";
import PostCard from "./PostComponent"
import SafeAreaView from 'react-native-safe-area-view';
import {StyleSheet} from "react-native";
import material from "../../../native-base-theme/variables/material";


export default class PostScreen extends Component {

    render() {
        let {params} = this.props.route.params; // Yes, this is getting this.props.route.params.params, this is intentional
        let navigation = this.props.navigation;
        console.log(params);

        const postTitle = params ? params.postTite : null;
        const postId = params ? params.postId : 0;


        return (
            <SafeAreaView style={styles.container} forceInset={{top: 'always'}}>
                <Header>
                    <Left>
                        <Button transparent
                                onPress={() => navigation.goBack()}>
                            <Icon name='arrow-back'/>
                        </Button>
                    </Left>
                    <Body>
                        <Title>{postTitle}</Title>
                    </Body>
                    <Right/>
                </Header>

            <Container>
                <Query query={LOAD_POST} variables={{postId: postId}}>
                    {({loading, error, data, refetch}) => {
                        if (loading) return <AppLoading/>;
                        if (error) {
                            console.log(error);
                            return <Text>`Error ${error.message}`</Text>;
                        }
                        return (
                            <PostCard post={data.post} commentRefetch={refetch}
                                      close={() => this.props.navigation.navigate('Feed')}/>
                        )
                    }}
                </Query>
            </Container>
            </SafeAreaView>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: material.brandInfo
    }
});

