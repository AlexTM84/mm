const faIconMatchExtension = [
    {
        name: 'file-alt',
        extensions: ['txt']
    },
    {
        name: 'file-pdf',
        extensions: ['pdf']
    },
    {
        name: 'file-word',
        extensions: ['doc', 'docx']
    },
    {
        name: 'file-excel',
        extensions: ['xls', 'xlsx']
    },
    {
        name: 'file-powerpoint',
        extensions: ['ppt', 'pptx']
    },
    {
        name: 'file-code',
        extensions: ['html', 'php', 'js', 'cs', 'java']
    },
    {
        name: 'file-video',
        extensions: ['avi', 'mpg', 'mpeg', 'mp4', 'mov']
    },
    {
        name: 'file-audio',
        extensions: ['mp3', 'wav', 'flac', 'ogg']
    },
    {
        name: 'file-archive',
        extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'tgz']
    },
];

export default class FaIconClassHelper {
    static getFaIconClass(file) {
        let str = 'fa fa-fw fa-';
        if (file.type == 'dir') {
            return str + 'folder';
        }
        var matchingIcon =
            faIconMatchExtension.find(
                iconMatch => iconMatch.extensions.indexOf(file.extension) >= 0
            )
        if (matchingIcon) {
            str += matchingIcon.name
        } else {
            str += 'file'
        }

        return str;
    }
}