const channelId2Name = new Map<string, string>([
    ["f6ae74e4-e64a-496f-8eda-a13eff57ca6b", "event/workshop/1weekjintai/sodan"],
    ["b640d9e1-51eb-4498-8a00-25f1a944c3d9", "event/workshop/3DCG/sodan"],
    ["2d45f90d-0bf5-4d36-bb53-9deefd4209b4", "event/workshop/algorithm/sodan"],
    ["8ba74928-ccc1-437d-acfb-d6c272146cc5", "event/workshop/AviUtl/sodan"],
    ["eca82100-8d5f-47de-b65c-3de804fc0e55", "event/workshop/ctf-intro/sodan"],
    ["d34c9ff9-e8f6-43e9-a9d8-89ecbe09a884", "event/workshop/ctf/sodan"],
    ["7872d426-c367-4ff9-a764-dd7567fbd105", "event/workshop/DacQ/sodan"],
    ["c39ae426-ef53-486f-8b99-df860dc9a7f5", "event/workshop/Dijkstra/sodan"],
    ["caa4f43d-a560-492a-96d6-8816a1aed8ea", "event/workshop/game/sodan"],
    ["aa73cdef-81f3-4ef6-b785-7a1d689b8067", "event/workshop/GameMakerStudio/sodan"],
    ["0aa0a101-6537-4131-b22a-a9caf08d551b", "event/workshop/git/sodan"],
    ["f53ee294-b4c2-4211-a74c-81213b48a566", "event/workshop/introToHeuristic/sodan"],
    ["352fadfe-53cd-4c7b-a1f5-ed89d053b687", "event/workshop/line-art/sodan"],
    ["efd28248-f364-44bc-90aa-5cdb15e87ffb", "event/workshop/machine-learning/sodan"],
    ["adc278dc-2fe6-4b4d-8a6a-d52a35cc3a11", "event/workshop/pg-basic/sodan"],
    ["f4a8685f-d86b-442a-baea-48bb60538324", "event/workshop/piscon/sodan"],
    ["4dcc3185-5fd3-4538-994d-02f8d291a87b", "event/workshop/procesing/sodan"],
    ["4e769917-f6da-4e2c-a15e-db443d23e47b", "event/workshop/python/sodan"],
    ["6d6d436c-709f-4fdc-bdf3-927b3daee63d", "event/workshop/python/sodan2"],
    ["581f7c4f-f788-459d-a21d-6c4d9b6604e8", "event/workshop/unity/sodan"],
    ["4458acb1-eb15-4b73-8bc5-f11e769b44fc", "event/workshop/web-basic/sodan"],
    ["27c966ce-0acc-40eb-b7fb-c13dc8d742d0", "event/workshop/webapp/sodan"],
    ["e68be4c9-ef0f-4a09-86fe-cdcc7af12a53", "team/algorithm/sodan"],
    ["ddaa9aa6-6eb6-4fb1-8df5-1d15ad614f59", "team/ctf/sodan"],
    ["6cb7fb40-1277-459d-ba6f-d054b271c1e4", "team/Game/GameJanaiJam/sodan"],
    ["22fafcc6-6ed1-4a4a-b386-ce8412cafcaf", "team/Game/sodan"],
    ["2bd2de43-bc5c-4ebe-9a24-6788072098dd", "team/Kaggle/sodan"],
    ["90e076dd-00d4-4b3a-820c-253e72f54964", "team/sound/sodan"],
    ["7a139b76-2498-41f7-97e8-170c1f6c6b75", "team/SysAd/random/sodan"],
    ["19e30e0f-e02e-4e55-ba89-9231bb52ad53", "univ/sodan"],
    ["aff37b5f-0911-4255-81c3-b49985c8943f", "random/sodan"]
]);

const channelName2Id = new Map<string, string>([
    ["event/workshop/1weekjintai/sodan", "f6ae74e4-e64a-496f-8eda-a13eff57ca6b"],
    ["event/workshop/3DCG/sodan", "b640d9e1-51eb-4498-8a00-25f1a944c3d9"],
    ["event/workshop/algorithm/sodan", "2d45f90d-0bf5-4d36-bb53-9deefd4209b4"],
    ["event/workshop/AviUtl/sodan", "8ba74928-ccc1-437d-acfb-d6c272146cc5"],
    ["event/workshop/ctf-intro/sodan", "eca82100-8d5f-47de-b65c-3de804fc0e55"],
    ["event/workshop/ctf/sodan", "d34c9ff9-e8f6-43e9-a9d8-89ecbe09a884"],
    ["event/workshop/DacQ/sodan", "7872d426-c367-4ff9-a764-dd7567fbd105"],
    ["event/workshop/Dijkstra/sodan", "c39ae426-ef53-486f-8b99-df860dc9a7f5"],
    ["event/workshop/game/sodan", "caa4f43d-a560-492a-96d6-8816a1aed8ea"],
    ["event/workshop/GameMakerStudio/sodan", "aa73cdef-81f3-4ef6-b785-7a1d689b8067"],
    ["event/workshop/git/sodan", "0aa0a101-6537-4131-b22a-a9caf08d551b"],
    ["event/workshop/introToHeuristic/sodan", "f53ee294-b4c2-4211-a74c-81213b48a566"],
    ["event/workshop/line-art/sodan", "352fadfe-53cd-4c7b-a1f5-ed89d053b687"],
    ["event/workshop/machine-learning/sodan", "efd28248-f364-44bc-90aa-5cdb15e87ffb"],
    ["event/workshop/pg-basic/sodan", "adc278dc-2fe6-4b4d-8a6a-d52a35cc3a11"],
    ["event/workshop/piscon/sodan", "f4a8685f-d86b-442a-baea-48bb60538324"],
    ["event/workshop/procesing/sodan", "4dcc3185-5fd3-4538-994d-02f8d291a87b"],
    ["event/workshop/python/sodan", "4e769917-f6da-4e2c-a15e-db443d23e47b"],
    ["event/workshop/python/sodan2", "6d6d436c-709f-4fdc-bdf3-927b3daee63d"],
    ["event/workshop/unity/sodan", "581f7c4f-f788-459d-a21d-6c4d9b6604e8"],
    ["event/workshop/web-basic/sodan", "4458acb1-eb15-4b73-8bc5-f11e769b44fc"],
    ["event/workshop/webapp/sodan", "27c966ce-0acc-40eb-b7fb-c13dc8d742d0"],
    ["team/algorithm/sodan", "e68be4c9-ef0f-4a09-86fe-cdcc7af12a53"],
    ["team/ctf/sodan", "ddaa9aa6-6eb6-4fb1-8df5-1d15ad614f59"],
    ["team/Game/GameJanaiJam/sodan", "6cb7fb40-1277-459d-ba6f-d054b271c1e4"],
    ["team/Game/sodan", "22fafcc6-6ed1-4a4a-b386-ce8412cafcaf"],
    ["team/Kaggle/sodan", "2bd2de43-bc5c-4ebe-9a24-6788072098dd"],
    ["team/sound/sodan", "90e076dd-00d4-4b3a-820c-253e72f54964"],
    ["team/SysAd/design/sodan", "5b1071fd-fd46-4dc4-a182-541d8c2deb34"],
    ["team/SysAd/random/sodan", "7a139b76-2498-41f7-97e8-170c1f6c6b75"],
    ["univ/sodan", "19e30e0f-e02e-4e55-ba89-9231bb52ad53"],
    ["random/sodan", "aff37b5f-0911-4255-81c3-b49985c8943f"]
]);

export { channelId2Name, channelName2Id };