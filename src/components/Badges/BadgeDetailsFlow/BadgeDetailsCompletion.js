import React, {Component, Fragment} from "react";
import {Body, Button, Container, Left, Right, Spinner, Text} from "native-base";
import material from "../../../../native-base-theme/variables/material";
import {Image, View} from "react-native";
import {LocalizationProvider as L} from "../../../localization/LocalizationProvider";
import {completionLevelToColor, completionLevelToFriendlyString} from "../BadgeUtils";
import {Dimensions } from "react-native";

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);


export class BadgeDetailsCompletion extends Component {

    render() {
        let {options, navigation, route} = this.props;
        let {badge, completion} = route.params; //


        return (
            <Fragment>
                <Container transparent >
                    <Body style={{flex:1, margin:10}}>
                        <View style={{
                            width: screenWidth/3 - screenWidth/10 + 40,
                            height: screenWidth/3 - screenWidth/10 + 40,
                            borderRadius: 4,
                            borderColor: completionLevelToColor(completion),
                            borderWidth: 20,
                            overflow: "hidden",
                            margin: 20,
                            backgroundColor: completionLevelToColor(completion)
                        }}>
                        <Image style={{width: screenWidth/3 - screenWidth/10, height: screenWidth/3 - screenWidth/10, backgroundColor: completionLevelToColor(completion)}}
                               source={badge.challenge.icon ? {uri: badge.challenge.icon.url + '?date=' + (new Date()).getHours()} : require('../../../../assets/image_select.png')}
                               resizeMode="contain"
                        />
                        </View>
                        <Text>{L.get("badge_acquired_hint", {badgeTitle: badge.challenge.title, completionLevelFriendly: completionLevelToFriendlyString(completion)})}</Text>

                    </Body>
                    <Text style={{marginLeft: 10}}>{L.get("select_achievements_hint")}</Text>

                    <View style={{backgroundColor: '#fff', width: "100%", height: 64}}>

                        <Button
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                margin: 10,
                                width: "95%",
                                height: 200
                            }}
                            onPress={async () => {
                                navigation.navigate("BadgeDetailsSelectAchievements", {badge: badge})

                            }}>
                            <Text>{L.get("select_achievements")}</Text>

                        </Button>

                    </View>
                </Container>
            </Fragment>
        )
    }
}